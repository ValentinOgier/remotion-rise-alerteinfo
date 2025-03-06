#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier si l'utilisateur est root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Ce script doit être exécuté en tant que root${NC}"
   exit 1
fi

# Installer git et autres dépendances nécessaires
echo -e "${GREEN}Installation des dépendances système...${NC}"
apt update

# Installation des dépendances avec gestion d'erreurs
DEPS=(
    "git"
    "nginx"
    "certbot"
    "python3-certbot-nginx"
    "curl"
    "nginx-extras"
    "ca-certificates"
    "fonts-liberation"
    "libasound2t64"
    "libatk-bridge2.0-0"
    "libatk1.0-0"
    "libc6"
    "libcairo2"
    "libcups2"
    "libdbus-1-3"
    "libexpat1"
    "libfontconfig1"
    "libgbm1"
    "libgcc1"
    "libglib2.0-0"
    "libgtk-3-0"
    "libnspr4"
    "libnss3"
    "libpango-1.0-0"
    "libpangocairo-1.0-0"
    "libstdc++6"
    "libx11-6"
    "libx11-xcb1"
    "libxcb1"
    "libxcomposite1"
    "libxcursor1"
    "libxdamage1"
    "libxext6"
    "libxfixes3"
    "libxi6"
    "libxrandr2"
    "libxrender1"
    "libxss1"
    "libxtst6"
    "lsb-release"
    "wget"
    "xdg-utils"
)

# Installation des paquets un par un avec gestion d'erreurs
for pkg in "${DEPS[@]}"; do
    echo -e "${GREEN}Installation de $pkg...${NC}"
    if ! apt install -y "$pkg"; then
        echo -e "${RED}Erreur lors de l'installation de $pkg${NC}"
        echo -e "${YELLOW}Tentative de continuer l'installation...${NC}"
    fi
done

# Installer Node.js et npm si non installés
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}Installation de Node.js et npm...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Demander le nom de domaine
read -p "Entrez votre nom de domaine (ex: api.mondomaine.com): " DOMAIN_NAME

# Vérifier que le nom de domaine n'est pas vide
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Le nom de domaine ne peut pas être vide${NC}"
    exit 1
fi

# Cloner le repository
echo -e "${GREEN}Clonage du repository Remotion...${NC}"
git clone https://github.com/ValentinOgier/remotion-rise-alerteinfo.git /opt/remotion-rise
cd /opt/remotion-rise

# Installer les dépendances Node.js
echo -e "${GREEN}Installation des dépendances Node.js...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de l'installation des dépendances Node.js${NC}"
    exit 1
fi

# Créer le service systemd pour Remotion
echo -e "${GREEN}Création du service systemd...${NC}"
cat > /etc/systemd/system/remotion-api.service << EOF
[Unit]
Description=Remotion API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/remotion-rise
ExecStart=/usr/bin/npm run serve
Restart=always
RestartSec=10
StandardOutput=append:/var/log/remotion-api.log
StandardError=append:/var/log/remotion-api.error.log
Environment=NODE_ENV=production
# Augmenter la limite de mémoire pour Node.js
Environment=NODE_OPTIONS="--max-old-space-size=4096"

[Install]
WantedBy=multi-user.target
EOF

# Créer la configuration NGINX
echo -e "${GREEN}Configuration de NGINX...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Logs détaillés
    error_log /var/log/nginx/api-error.log debug;
    access_log /var/log/nginx/api-access.log;

    # Timeouts optimisés pour les requêtes longues
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    send_timeout 600s;

    # Configuration CORS globale
    add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    add_header 'Access-Control-Max-Age' 1728000 always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
        proxy_hide_header 'Access-Control-Expose-Headers';
        proxy_hide_header 'Access-Control-Max-Age';

        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /render-still {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
        proxy_hide_header 'Access-Control-Expose-Headers';
        proxy_hide_header 'Access-Control-Max-Age';

        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /render-video {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
        proxy_hide_header 'Access-Control-Expose-Headers';
        proxy_hide_header 'Access-Control-Max-Age';

        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /preview {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        
        proxy_hide_header 'Access-Control-Allow-Origin';
        proxy_hide_header 'Access-Control-Allow-Methods';
        proxy_hide_header 'Access-Control-Allow-Headers';
        proxy_hide_header 'Access-Control-Allow-Credentials';
        proxy_hide_header 'Access-Control-Expose-Headers';
        proxy_hide_header 'Access-Control-Max-Age';

        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /out/ {
        alias /opt/remotion-rise/out/;
        expires 1h;
        add_header Cache-Control "public, no-transform";
        
        add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://composer.risele.media' always;
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    client_max_body_size 50M;
}
EOF

# Activer le site NGINX
ln -sf /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Vérifier la configuration NGINX
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur dans la configuration NGINX${NC}"
    exit 1
fi

# Démarrer les services
echo -e "${GREEN}Démarrage des services...${NC}"
systemctl daemon-reload
systemctl enable remotion-api
systemctl start remotion-api
systemctl restart nginx

# Configurer Let's Encrypt
echo -e "${GREEN}Configuration de Let's Encrypt...${NC}"
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect

# Vérifier que tout fonctionne
echo -e "${GREEN}Vérification des services...${NC}"
if systemctl is-active --quiet remotion-api; then
    echo -e "${GREEN}✓ Service Remotion API démarré${NC}"
else
    echo -e "${RED}✗ Erreur: Le service Remotion API n'a pas démarré${NC}"
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Service NGINX démarré${NC}"
else
    echo -e "${RED}✗ Erreur: Le service NGINX n'a pas démarré${NC}"
fi

echo -e "\n${GREEN}Installation terminée !${NC}"
echo -e "${YELLOW}Votre API Remotion est accessible sur : https://$DOMAIN_NAME${NC}"
echo -e "${YELLOW}Les logs sont disponibles dans :${NC}"
echo -e "- /var/log/remotion-api.log"
echo -e "- /var/log/remotion-api.error.log" 