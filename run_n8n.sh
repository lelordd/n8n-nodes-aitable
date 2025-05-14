#!/bin/bash
 
# Aller dans le dossier custom de n8n
cd ~/.n8n/custom || { echo "Impossible d'accéder au dossier ~/.n8n/custom"; exit 1; }
 
# Désinstaller le lien du package n8n-nodes-aitable
npm unlink n8n-nodes-aitable
 
# Aller dans le dossier n8n-nodes-aitable
cd ~/n8n-nodes-aitable || { echo "Impossible d'accéder au dossier ~/n8n-nodes-aitable"; exit 1; }
 
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
# n8n start