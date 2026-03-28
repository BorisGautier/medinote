#!/bin/bash
# 🩺 MediNote - GCP VPS "One-Click" Provisioning Script
# Ce script prépare votre VM Google Compute Engine (Debian/Ubuntu) pour accueillir MediNote.

set -e

echo "🚀 Début de la configuration de la VM GCP..."

# 1. Mise à jour système
sudo apt-get update && sudo apt-get upgrade -y

# 2. Installation de Docker
echo "📦 Installation de Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Installation de Docker Compose (plus récent v2)
echo "📦 Installation de Docker Compose v2..."
sudo apt-get install -y docker-compose-plugin

# 4. Installation du Monitoring Agent GCP (Ops Agent) pour les logs
echo "📊 Installation de l'Agent Ops Google Cloud..."
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# 5. Création du dossier projet
mkdir -p ~/medinote/backend/logs
mkdir -p ~/medinote/mongo_data

# 6. Configuration de l'authentification Artifact Registry sur la VM
echo "🔑 Configuration de l'authentification Docker pour Artifact Registry..."
# L'instance doit avoir le scope "cloud-platform" ou "artifact-registry" pour que ceci fonctionne sans clé additionnelle.
sudo gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

echo "✅ Configuration Terminée !"
echo "⚠️  Merci de vous déconnecter et vous reconnecter (ou faire 'newgrp docker') pour utiliser docker sans sudo."
echo "💡 Vous pouvez maintenant lancer la première mouture avec 'docker compose up -d' sur votre machine locale via CI/CD."
