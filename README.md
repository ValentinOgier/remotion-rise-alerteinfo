# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to Rise Remotion News Project

## Commands
# Installer Node.js, npm et npx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node -v
npm -v
npx -v

# Cloner le dépôt Git
git clone https://github.com/ValentinOgier/remotion-rise-alerteinfo.git
cd remotion-rise-alerteinfo

# Installer les dépendances
npm install

# Ouvrir le port 3000 sur le pare-feu
sudo ufw allow 3000/tcp
sudo ufw reload

# Lancer l'application
npm run dev