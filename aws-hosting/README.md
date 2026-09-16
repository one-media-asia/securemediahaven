# AWS hosting bootstrap for Tingi

This is a simple Ubuntu EC2 setup for hosting, VPN, and a free reseller-style pilot environment.

## 1) Launch EC2
- AMI: Ubuntu 22.04 LTS
- Instance type: t3.small or t3.medium
- Storage: 20-50GB gp3
- Security group:
  - SSH: your IP only
  - HTTP: 0.0.0.0/0
  - HTTPS: 0.0.0.0/0

## 2) Connect
```bash
ssh -i your-key.pem ubuntu@PUBLIC_IP
```

## 3) System setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx curl fail2ban ufw certbot python3-certbot-nginx
```

## 4) Enable firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 5) Configure Nginx
Nginx virtual hosts must be stored in `sites-available` and linked into
`sites-enabled`. Do not paste a `server { ... }` block into `/etc/nginx/nginx.conf`
or inside another `server` block.

From this repository, copy the complete host configuration and replace the
default site:
```bash
sudo cp aws-hosting/nginx-hosting.conf /etc/nginx/sites-available/onemedia.asia
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/onemedia.asia /etc/nginx/sites-enabled/onemedia.asia
```

If Nginx currently reports `"server" directive is not allowed here`, repair the
site from the EC2 shell with:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/onemedia.asia
sudo cp aws-hosting/nginx-hosting.conf /etc/nginx/sites-available/onemedia.asia
sudo ln -s /etc/nginx/sites-available/onemedia.asia /etc/nginx/sites-enabled/onemedia.asia
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6) HTTPS with Let's Encrypt
```bash
sudo certbot --nginx -d hosting.onemedia.asia
```

## 7) Free reseller-style panel: aaPanel
aaPanel manages its own Nginx, PHP, and database stack. Install it on a fresh
Ubuntu EC2 instance, or uninstall/disable the manually installed Nginx stack
first. Installing aaPanel on top of an already configured server can overwrite
virtual-host and service settings.

```bash
sudo -i
URL=https://www.aapanel.com/script/install_panel_en.sh
INSTALLER=/root/install_panel_en.sh
rm -f "$INSTALLER"
curl -fL --proto '=https' --tlsv1.2 -o "$INSTALLER" "$URL"
test -s "$INSTALLER"
head -n 1 "$INSTALLER"
bash "$INSTALLER" ipssl
```

The `head` command should show a shell-script header such as `#!/bin/bash`.
If it shows `<html>` or the download fails, stop and do not run the installer.
After installation completes, verify that aaPanel created its service:
```bash
test -x /etc/init.d/bt && echo "aaPanel installed" || echo "aaPanel installation failed"
```

Then open the admin URL shown in the installer output. The panel commonly uses
port `7800` or another port printed by the installer, so allow that exact TCP
port in the EC2 security group and UFW only from your administrator IP.

If the installer finishes without displaying a URL, print the saved panel
login details from the server:
```bash
sudo bt default
sudo systemctl status bt --no-pager
sudo cat /www/server/panel/data/port.pl
```

The URL will normally be in the form `https://EC2_PUBLIC_IP:PORT`. Replace
`EC2_PUBLIC_IP` with the instance public IPv4 address and allow the displayed
`PORT` in the EC2 security group. Do not expose the panel port to the whole
internet; restrict it to your administrator IP where possible.

## 8) Tor onion service (dark-web hosting)
```bash
sudo apt install -y tor
sudo nano /etc/tor/torrc
```

Add:
```tor
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
```

Restart:
```bash
sudo systemctl restart tor
sudo systemctl status tor
```

Get the onion address:
```bash
sudo cat /var/lib/tor/hidden_service/hostname
```

## 9) VPN server
For the VPN setup, use a separate EC2 instance, or a second server if you want isolation.

Suggested:
- Ubuntu 22.04
- t3.small
- security group: UDP 1194 open to your IP or all
- install OpenVPN Access Server or WireGuard

## 10) DNS
Create records in Route53 or your registrar:
- hosting.onemedia.asia -> EC2 public IP
- vpn.onemedia.asia -> VPN EC2 public IP
- panel.onemedia.asia -> EC2 public IP

## 11) Operational notes
- Keep SSH locked to your IP
- rotate keys
- enable CloudWatch alarms
- set up snapshots/backups
- keep customer domains isolated
