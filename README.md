# 🏥 MediNote — Plateforme de Prise de Rendez-Vous Médicaux

> Application web PWA permettant aux patients de trouver des médecins par hôpital et spécialité, consulter les disponibilités et réserver des rendez-vous avec confirmation par email.

**URL Production :** https://medinote.borisgauty.com

---

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js 20 + TypeScript + Express |
| Base de données | MongoDB 7 + Mongoose |
| Cache / Locks | Redis 7 |
| Logs | Winston + Daily Rotate Files |
| Rate Limiting | express-rate-limit + rate-limit-redis |
| Emails | Nodemailer + BullMQ Queue |
| Frontend | React 18 + Vite + PWA |
| Animations | Framer Motion |
| Auth | JWT (Access 15min + Refresh 7j) |
| Infrastructure | Docker + Nginx + Let's Encrypt |

---

## 🚀 Démarrage Rapide

### Développement local

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd medinote

# 2. Backend
cd backend
cp .env.example .env  # Remplir les variables
npm install
npm run dev

# 3. Frontend (autre terminal)
cd ../frontend
npm install
npm run dev
```

### 🐳 Production (VPS)

```bash
# 1. Se connecter au VPS
ssh user@votre-vps.com

# 2. Cloner le projet
git clone <votre-repo>
cd medinote

# 3. Configurer les variables d'environnement
cp .env.example .env
nano .env  # Remplir toutes les valeurs

# 4. Obtenir le certificat SSL (première fois)
docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email votre@email.com \
  --agree-tos --no-eff-email \
  -d medinote.borisgauty.com

# 5. Démarrer tous les services
docker compose up -d --build

# 6. Vérifier que tout tourne
docker compose ps
docker compose logs -f backend
```

---

## 📂 Structure du Projet

```
medinote/
├── backend/            # API Node.js + TypeScript
│   ├── src/
│   │   ├── config/     # DB, Redis, Logger
│   │   ├── middlewares/ # Auth, RateLimit, Validate
│   │   ├── models/     # Mongoose schemas
│   │   ├── modules/    # Routes + Controllers + Services
│   │   ├── queues/     # BullMQ email queue
│   │   ├── templates/  # HTML email templates
│   │   └── utils/      # JWT, CRON
│   └── Dockerfile
├── frontend/           # React 18 + PWA
│   ├── src/
│   │   ├── animations/ # Framer Motion variants
│   │   ├── api/        # Axios client
│   │   ├── components/ # UI + Layout
│   │   ├── pages/      # Pages React
│   │   ├── stores/     # Zustand
│   │   ├── styles/     # Design system CSS
│   │   └── types/      # TypeScript interfaces
│   └── Dockerfile
├── nginx/
│   └── nginx.conf      # Reverse proxy + SSL
├── docker-compose.yml  # 5 services orchestrés
├── .env.example        # Template des variables
└── README.md
```

---

## 🔑 Variables d'Environnement

Copiez `.env.example` en `.env` et remplissez :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGO_ROOT_PASS` | Mot de passe MongoDB | `MyStr0ngPass!` |
| `REDIS_PASSWORD` | Mot de passe Redis | `RedisPass123!` |
| `JWT_SECRET` | Secret JWT (64 chars min) | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Secret refresh token | `openssl rand -hex 64` |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_USER` | Email expéditeur | `vous@gmail.com` |
| `SMTP_PASS` | App password SMTP | `abcd efgh ijkl mnop` |

---

## 🐳 Services Docker

| Service | Description | Port interne |
|---------|-------------|--------------|
| `mongodb` | Base de données | 27017 |
| `redis` | Cache + Rate Limits | 6379 |
| `backend` | API REST | 5000 |
| `frontend` | PWA React | 80 |
| `nginx` | Reverse proxy + SSL | 80/443 |
| `certbot` | Renouvellement SSL | — |

---

## 📡 Endpoints API Principaux

```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion
POST   /api/auth/refresh           Renouveler le token

GET    /api/hospitals              Liste des hôpitaux
GET    /api/hospitals/:id          Détail d'un hôpital
GET    /api/hospitals/:id/doctors  Médecins d'un hôpital

GET    /api/doctors                Liste des médecins
GET    /api/doctors/:id            Profil d'un médecin
GET    /api/doctors/:id/availability Créneaux disponibles

POST   /api/appointments           Créer un RDV
GET    /api/appointments/me        Mes rendez-vous
PATCH  /api/appointments/:id/cancel Annuler un RDV

GET    /api/specialties            Liste des spécialités
```

---

## 🛡️ Rate Limiting

| Endpoint | Limite |
|----------|--------|
| Global | 200 req / 15 min / IP |
| `/api/auth/login` | 10 req / 15 min / IP |
| `/api/auth/register` | 5 req / 1h / IP |
| `/api/appointments` (POST) | 5 req / 1h / IP |
| Routes publiques | 100 req / 15 min / IP |

---

## 📧 Emails Automatiques

| Événement | Déclencheur |
|-----------|-------------|
| ✅ Confirmation | Immédiatement après réservation |
| ⏰ Rappel 24h | CRON toutes les heures |
| ❌ Annulation | Lors de l'annulation |

---

## 🔄 Commandes Utiles

```bash
# Voir les logs en temps réel
docker compose logs -f backend

# Renouveler les certificats SSL
docker compose exec certbot certbot renew

# Restart un service
docker compose restart backend

# Mettre à jour après un git pull
git pull
docker compose up -d --build backend frontend

# Backup MongoDB
docker compose exec mongodb mongodump --authenticationDatabase admin \
  -u root -p $MONGO_ROOT_PASS --out /backup

# Accéder à MongoDB shell
docker compose exec mongodb mongosh -u root -p $MONGO_ROOT_PASS

# Vider le cache Redis
docker compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHDB
```
