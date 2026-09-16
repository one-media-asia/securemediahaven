#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-hosting.yourdomain.com}"
EMAIL="${2:-admin@yourdomain.com}"

if [[ "$EUID" -eq 0 ]]; then
  echo "This script should be run as a normal user with sudo."
  exit 1
fi

sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y nginx curl fail2ban ufw certbot python3-certbot-nginx tor

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

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

sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}"

sudo tee /etc/tor/torrc > /dev/null <<EOF
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
EOF

sudo systemctl enable tor
sudo systemctl restart tor
sudo systemctl status tor --no-pager | sed -n '1,20p'

printf '\nOnion hostname:\n'
sudo cat /var/lib/tor/hidden_service/hostname

printf '\nSetup complete.\n'
printf 'Public host: https://%s\n' "${DOMAIN}"
printf 'Tor hidden service: http://$(sudo cat /var/lib/tor/hidden_service/hostname)\n'
