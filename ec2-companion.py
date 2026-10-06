#!/usr/bin/env python3
"""One Media Asia VPN companion config API.

Runs on the VPN server itself (13.250.50.221, port 3001) and serves only
Vercel's server-side /api endpoints. It provisions real per-customer configs:

  * standard  -> a WireGuard peer on wg0 (UDP/1194)
  * shadow    -> a dedicated Trojan password added to the Xray inbound (TCP/443)

Authentication is a shared X-API-Key stored in /etc/vpn-companion-key.
Generated config files are written under /home/ubuntu/vpn-configs and can be
re-downloaded by name; re-download requires a paid Stripe session on the
calling side, verified by Vercel /api/vpn-file before it hits this API.
"""

import json
import os
import re
import secrets
import subprocess
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 3001
SERVER_HOST = "13.250.50.221"
SERVER_PUBKEY = "WfNIsVvww85JIUFw2U3IUudwukKO55gyiVpwc2zlAjo="  # wg0 public key
WG_PORT = 1194
WG_CONFIG = Path("/etc/wireguard/wg0.conf")
WG_SUBNET = "10.66.66.0/24"
XRAY_CONFIG = Path("/usr/local/etc/xray/config.json")
CONFIG_DIR = Path("/home/ubuntu/vpn-configs")
KEY_FILE = Path("/etc/vpn-companion-key")
EXIT_IP = SERVER_HOST

KEY_RE = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


def load_api_key():
    try:
        return KEY_FILE.read_text().strip()
    except OSError:
        return ""


API_KEY = load_api_key()


def run(cmd, timeout=30):
    return subprocess.run(
        cmd, capture_output=True, text=True, timeout=timeout
    )


def sh(cmd):
    res = run(["bash", "-c", cmd])
    if res.returncode != 0:
        raise RuntimeError(f"{cmd!r} failed: {res.stderr.strip()}")
    return res.stdout.strip()


def generate_wg_keypair():
    priv = sh("wg genkey")
    pub = sh(f"printf '%s' '{priv}' | wg pubkey")
    psk = sh("wg genpsk")
    return priv, pub, psk


def existing_wg_addresses(config_text):
    addrs = set()
    for m in re.finditer(r"AllowedIPs\s*=\s*([^\n]+)", config_text):
        addrs.update(a.split("/")[0] for a in m.group(1).split(","))
    return addrs


def next_free_client_ip():
    text = WG_CONFIG.read_text()
    used = existing_wg_addresses(text)
    # Server is .1; existing test client is .2. Start at .3.
    for host in range(3, 255):
        ip = f"10.66.66.{host}"
        if ip not in used:
            return ip
    raise RuntimeError("WireGuard /24 exhausted")


def add_wireguard_peer(client_name):
    priv, pub, psk = generate_wg_keypair()
    ip = next_free_client_ip()

    spawn_key = subprocess.Popen(["tee", "/tmp/.wg-psk"], stdin=subprocess.PIPE)
    spawn_key.communicate(psk.encode())
    sh(f"chmod 600 /tmp/.wg-psk")
    try:
        sh(f"wg set wg0 peer {pub} preshared-key /tmp/.wg-psk allowed-ips {ip}/32")
    finally:
        try:
            Path("/tmp/.wg-psk").unlink()
        except OSError:
            pass

    peer_block = (
        f"\n[Peer] # {client_name}\n"
        f"PublicKey = {pub}\n"
        f"PresharedKey = {psk}\n"
        f"AllowedIPs = {ip}/32\n"
    )
    with WG_CONFIG.open("r") as fh:
        cfg = fh.read()
    if f"# {client_name}" not in cfg:
        with WG_CONFIG.open("a") as fh:
            fh.write(peer_block)

    client_conf = (
        "[Interface]\n"
        f"Address = {ip}/24\n"
        f"PrivateKey = {priv}\n"
        "DNS = 1.1.1.1\n"
        "\n"
        "[Peer]\n"
        f"PublicKey = {SERVER_PUBKEY}\n"
        f"PresharedKey = {psk}\n"
        f"Endpoint = {SERVER_HOST}:{WG_PORT}\n"
        "AllowedIPs = 0.0.0.0/0, ::/0\n"
        "PersistentKeepalive = 25\n"
    )
    return client_name, client_conf, f"{ip}/24"


def add_trojan_customer(client_name):
    password = secrets.token_urlsafe(18)
    cfg = json.loads(XRAY_CONFIG.read_text())

    trojan_inbound = next(
        (ib for ib in cfg["inbounds"] if ib.get("protocol") == "trojan"),
        None,
    )
    if trojan_inbound is None:
        raise RuntimeError("No trojan inbound found in xray config")

    clients = trojan_inbound.setdefault("settings", {}).setdefault("clients", [])
    if not any(c.get("password") == password for c in clients):
        clients.append({"password": password, "comment": client_name})
        XRAY_CONFIG.write_text(json.dumps(cfg, indent=2) + "\n")
        run(["systemctl", "restart", "xray"])
        if run(["systemctl", "is-active", "xray"]).returncode != 0:
            raise RuntimeError("xray failed to restart after adding customer")

    client_cfg = {
        "log": {"loglevel": "warning"},
        "inbounds": [
            {"port": 10808, "listen": "127.0.0.1", "protocol": "socks", "settings": {"udp": True}},
            {"port": 10809, "listen": "127.0.0.1", "protocol": "http"},
        ],
        "outbounds": [
            {
                "protocol": "trojan",
                "settings": {
                    "servers": [
                        {"address": "trojan.onemedia.asia", "port": 443, "password": password}
                    ]
                },
                "streamSettings": {
                    "network": "tcp",
                    "security": "tls",
                    "tlsSettings": {"serverName": "trojan.onemedia.asia"},
                },
            }
        ],
    }
    return client_name, json.dumps(client_cfg, indent=2), "Trojan/TLS (TCP/443)"


class Handler(BaseHTTPRequestHandler):
    server_version = "OneMediaVPNCompanion/1.0"

    def _auth(self):
        if not API_KEY:
            self._json(500, {"error": "Companion API key not configured"})
            return False
        if not secrets.compare_digest(self.headers.get("X-API-Key", ""), API_KEY):
            self._json(401, {"error": "Unauthorized"})
            return False
        return True

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def do_POST(self):
        if self.path.rstrip("/") != "/generate":
            self._json(404, {"error": "Not found"})
            return
        if not self._auth():
            return

        body = self._read_json()
        email = (body.get("email") or "").strip().lower()
        country = (body.get("country") or "").strip().upper()
        config_type = "shadow" if country == "CN" else "standard"

        if not email or "@" not in email:
            self._json(400, {"error": "Email is required"})
            return

        is_shadow = config_type == "shadow"
        stamp = int(time.time() * 1000)
        client_name = f"trojan-{stamp}" if is_shadow else f"wg-{stamp}"
        label = client_name if KEY_RE.match(client_name) else None
        if not label:
            self._json(500, {"error": "Invalid client name generated"})
            return

        try:
            if is_shadow:
                name, content, summary = add_trojan_customer(client_name)
                ext = "json"
            else:
                name, content, summary = add_wireguard_peer(client_name)
                ext = "conf"

            CONFIG_DIR.mkdir(parents=True, exist_ok=True)
            path = CONFIG_DIR / f"{name}.{ext}"
            path.write_text(content)
            print(f"provisioned {name} ({config_type}) for {email}")
            self._json(200, {
                "client_name": name,
                "config_type": config_type,
                "summary": summary,
                "filename": f"{name}.{ext}",
            })
        except Exception as exc:  # noqa: BLE001 - report as 500 to caller
            print(f"generate error for {email}: {exc}")
            self._json(500, {"error": f"Config generation failed: {exc}"})

    def do_GET(self):
        if self.path.rstrip("/") == "/health":
            self._json(200, {"status": "ok", "port": PORT})
            return

        if self.path.startswith("/config/"):
            if not self._auth():
                return
            name = self.path[len("/config/"):].split("?")[0]
            if not KEY_RE.match(name):
                self._json(400, {"error": "Invalid config name"})
                return
            candidates = list(CONFIG_DIR.glob(f"{name}.*"))
            if not candidates:
                self._json(404, {"error": "Config not found"})
                return
            path = candidates[0]
            try:
                content = path.read_bytes()
            except OSError:
                self._json(404, {"error": "Config not found"})
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header(
                "Content-Disposition", f'attachment; filename="{path.name}"'
            )
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self._json(404, {"error": "Not found"})

    def log_message(self, fmt, *args):
        sys.stderr.write(f"{self.address_string()} - {fmt % args}\n")


if __name__ == "__main__":
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"One Media Asia VPN companion API on :{PORT}")
    server.serve_forever()