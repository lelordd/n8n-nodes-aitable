#!/bin/bash
 
# Aller dans le dossier custom de n8n
cd ~/.n8n/custom || { echo "Impossible d'accéder au dossier ~/.n8n/custom"; exit 1; }
 
# Désinstaller le lien du package n8n-nodes-aitable
npm unlink n8n-nodes-aitable
 
# Aller dans le dossier n8n-nodes-aitable
cd /Users/appmonster/Documents/GitHub/n8n-nodes-aitable || { echo "Impossible d'accéder au dossier du projet"; exit 1; }
 
# Supprimer les dossiers et fichiers inutiles
rm -rf dist node_modules package-lock.json
 
# Réinstaller les packages
npm install
 
# Recompiler le paquet
npm run build
 
# Lier le paquet
npm link
 
# Retourner dans le dossier custom de n8n
cd ~/.n8n/custom || { echo "Impossible d'accéder au dossier ~/.n8n/custom"; exit 1; }
 
# Lier le paquet n8n-nodes-aitable
npm link n8n-nodes-aitable
 
# Démarrer n8n
n8n start


version: '3.8'
services:
  # Service de build pour votre custom node
  n8n-custom-builder:
    image: node:18-alpine
    working_dir: /build
    volumes:
      - custom-node:/output
    command: |
      sh -c "
        echo '🔧 Installation des outils...'
        apk add --no-cache git
        npm install -g pnpm
        
        echo '📦 Clonage du repository...'
        git clone -b main https://github.com/lelordd/n8n-nodes-aitable.git /tmp/build
        cd /tmp/build
        
        echo '🔨 Build du custom node...'
        pnpm install
        pnpm run build
        
        echo '📄 Récupération du nom du package...'
        PACKAGE_NAME=\$(node -p \"require('./package.json').name\")
        
        echo '🚀 Déploiement vers le volume...'
        mkdir -p /output/\$PACKAGE_NAME
        cp -r dist/* /output/\$PACKAGE_NAME/
        cp package.json /output/\$PACKAGE_NAME/
        
        echo '✅ Build et déploiement terminés!'
      "
    networks:
      - n8n-network