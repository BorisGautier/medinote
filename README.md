# 🏥 MediNote — Plateforme de Prise de Rendez-Vous Médicaux

> Application web PWA permettant aux patients de trouver des médecins par hôpital et spécialité, consulter les disponibilités et réserver des rendez-vous avec confirmation par email.

**URL Production :** [https://medinote.borisgauty.com](https://medinote.borisgauty.com)

---

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js 20 + TypeScript + Express |
| Base de données | MongoDB 7 + Mongoose |
| Cache / Locks | Redis 7 |
| Logs | Winston + Google Cloud Ops Agent |
| Emails | Nodemailer + BullMQ Queue |
| Frontend | React 18 + Vite + PWA |
| Serveur Web | **Apache 2.4 (Alpine)** |
| CI/CD | GitHub Actions |
| Infrastructure | **Google Compute Engine (GCE)** |

---

## 🚀 Démarrage Rapide

### Développement local

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd medinote

# 2. Backend
cd backend
cp .env.example .env  # Remplir les variables (Mongo/Redis local ou Docker)
npm install
npm run dev

# 3. Frontend (autre terminal)
cd ../frontend
npm install
npm run dev
```

### ☁️ Déploiement Google Cloud (VPS Style)

MediNote est configuré pour être déployé sur une VM Google Cloud via **Docker Compose**.

1. **Initialisation de la VM** :
   Connectez-vous à votre VM GCE et lancez le script de configuration :
   ```bash
   chmod +x gcp-setup.sh
   ./gcp-setup.sh
   ```

2. **Secrets GitHub** :
   Configurez les secrets suivants dans votre dépôt GitHub :
   - `GCP_PROJECT_ID` : ID de votre projet Google Cloud.
   - `GCP_SA_KEY` : Clé JSON d'un compte de service avec accès Artifact Registry & Compute.
   - `GCP_VM_IP` : IP publique de votre VM.
   - `GCP_SSH_KEY` : Clé privée SSH pour la connexion à la VM.
   - `GCP_USERNAME` : Utilisateur SSH sur la VM.

3. **Déploiement Automatique** :
   Chaque push sur la branche `main` déclenche le workflow **CD** qui build, push sur Artifact Registry et met à jour la VM.

---

## 📂 Structure du Projet

```
medinote/
├── .github/            # Workflows CI/CD, Templates Issues/PR
├── backend/            # API Node.js + TypeScript
│   ├── src/
│   │   ├── config/     # DB, Redis, Logger
│   │   ├── modules/    # Routes + Controllers + Services
│   │   └── __tests__/  # Tests unitaire & intégration (Jest)
│   └── Dockerfile
├── frontend/           # React 18 + PWA
│   ├── src/
│   │   ├── api/        # Axios client
│   │   ├── store/      # Zustand
│   │   └── __tests__/  # Tests composants (Vitest)
│   └── Dockerfile      # Basé sur Apache 2.4
├── docker-compose.yml  # Orchestration multi-conteneurs
├── gcp-setup.sh        # Script d'auto-configuration GCE
├── CONTRIBUTING.md     # Guide de contribution (Français)
└── LICENSE             # Licence MIT
```

---

## 🛡️ Gouvernance & Standards

- **Tests** : Obligatoires avant chaque PR. Lancez `npm test` dans chaque dossier.
- **Branches** : 
  - `main` : Production uniquement (Accès restreint).
  - `dev` : Intégration et développement (Mises à jour Dependabot hebdomadaires).
- **Labels** : Nous utilisons des labels standards (`bug`, `enhancement`, `dependencies`).

---

## 🐳 Services Docker Production

| Service | Image | Description | Port |
|---------|-------|-------------|------|
| `mongodb` | `mongo:7` | BD Principale | 27017 |
| `redis` | `redis:7-alpine`| Cache & Locks | 6379 |
| `backend` | Personnalisée | API Express | 5000 |
| `frontend`| Personnalisée | React via Apache | 5173 |

---

## 📧 Emails Automatiques

- ✅ **Confirmation** : Immédiatement après réservation.
- ⏰ **Rappel 24h** : Planifié via BullMQ.
- ❌ **Annulation** : Lors de l'annulation d'un créneau.

---

## 📄 Licence
Ce projet est sous [Licence MIT](LICENSE).
