#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${1:-hosting.onemedia.asia}"
EMAIL="${2:-admin@onemedia.asia}"

if [[ "$EUID" -eq 0 ]]; then
  echo "Run this script as a normal user; it uses sudo internally."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required but not installed."
  exit 1
fi

if ! [[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ ]]; then
  echo "Invalid domain: $DOMAIN"
  exit 1
fib

if ! [[ "$EMAIL" =~ ^[^[:space:]]+@[^[:space:]]+\.[^[:space:]]+$ ]]; then
  echo "Invalid email: $EMAIL"
  exit 1
fi

echo "==> Installing required packages"
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y nginx curl fail2ban ufw certbot python3-certbot-nginx tor

echo "==> Enabling firewall"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "==> Setting up web root for $DOMAIN"
sudo mkdir -p "/var/www/${DOMAIN}/html"
echo "<h1>${DOMAIN}</h1><p>Hosting node ready.</p>" | sudo tee "/var/www/${DOMAIN}/html/index.html" > /dev/null

sudo tee "/etc/nginx/sites-available/${DOMAIN}" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root /var/www/${DOMAIN}/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

sudo ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Requesting TLS certificate from Let’s Encrypt"
if ! sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect; then
  echo "Certbot failed. Make sure DNS for ${DOMAIN} points to this server and try again."
  exit 1
fi

echo "==> Configuring Tor hidden service"
sudo mkdir -p /var/lib/tor/hidden_service
sudo chown debian-tor:debian-tor /var/lib/tor/hidden_service
sudo chmod 700 /var/lib/tor/hidden_service

sudo tee /etc/tor/torrc > /dev/null <<EOF
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
EOF

sudo systemctl enable --now tor
sudo systemctl restart tor
sudo systemctl status tor --no-pager --lines=20 | sed -n '1,20p'

ONION_HOST="$(sudo cat /var/lib/tor/hidden_service/hostname 2>/dev/null || true)"
if [[ -z "$ONION_HOST" ]]; then
  echo "Tor onion hostname not ready yet. Check: sudo journalctl -u tor -n 50"
  exit 1
fi

printf '\nSetup complete.\n'
printf 'Public host: https://%s\n' "${DOMAIN}"
printf 'Tor hidden service: http://%s\n' "$ONION_HOST"
