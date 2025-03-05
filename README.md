# Générateur d'Infographies Rise

Ce projet est un générateur d'infographies dynamiques utilisant Remotion pour le rendu des images et des vidéos. Il permet de créer des infographies personnalisées avec une interface utilisateur intuitive.

## Architecture

Le projet est composé de deux parties principales :

1. **Interface utilisateur (Frontend)**
   - Interface web responsive en HTML/CSS/JavaScript
   - Gestion des formulaires et des interactions utilisateur
   - Prévisualisation en temps réel
   - Gestion des exports (images et vidéos)

2. **Serveur de rendu Remotion (Backend)**
   - API REST pour le rendu des compositions
   - Gestion des files d'attente de rendu
   - Stockage temporaire des fichiers générés

## Prérequis

- Node.js >= 16.x
- PHP >= 8.1
- Composer

## Installation et développement

1. **Installation des dépendances Node.js**
```bash
npm install
```

2. **Démarrage du serveur de développement**
```bash
# Dans un terminal, démarrez le serveur Remotion
npm run dev
```

L'application sera accessible à l'adresse : `https://**HÔTE**:3001`

## Configuration
Configurez la variable suivante dans les fichiers html
```bash
const REMOTION_API_URL = 'http://localhost:3001';
```