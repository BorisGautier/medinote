# Cahier de Tests — MediNote

**Projet :** MediNote — Plateforme de prise de rendez-vous médicaux  
**Version :** 1.0.0  
**URL de test :** `http://localhost:5173` (Frontend) · `http://localhost:5000` (Backend API)  
**Date :** Mars 2026

---

## Conventions

| Icône | Signification |
|-------|--------------|
| ✅ | Résultat attendu — Succès |
| ❌ | Résultat attendu — Échec / Erreur |
| 🔒 | Requiert une authentification |
| 🗄️ | Prérequis base de données |

**Statuts :** `[ ]` Non testé · `[P]` Passé · `[F]` Échoué · `[B]` Bloqué

---

## Module 1 — Authentification

### 1.1 Inscription (POST /api/auth/register)

#### TC-AUTH-001 — Inscription valide
- **Données :**
  ```json
  { "firstName": "Jean", "lastName": "Dupont", "email": "jean.dupont@test.cm", "password": "Password123!", "phone": "+237690000001" }
  ```
- **Résultat :** ✅ HTTP 201 — `{ accessToken: "...", user: { role: "patient" } }`
- **Vérification :** Utilisateur en BDD avec `isEmailVerified: false`
- **Statut :** `[ ]`

#### TC-AUTH-002 — Email déjà utilisé
- **Données :** Même email qu'en TC-AUTH-001
- **Résultat :** ❌ HTTP 409 — `{ message: "Email déjà utilisé" }`
- **Statut :** `[ ]`

#### TC-AUTH-003 — Email invalide
- **Données :** `email: "jean_dupont"`
- **Résultat :** ❌ HTTP 422 — `{ message: "Email invalide" }`
- **Statut :** `[ ]`

#### TC-AUTH-004 — Mot de passe trop court
- **Données :** `password: "abc123"`
- **Résultat :** ❌ HTTP 422 — `{ message: "Mot de passe: 8 caractères minimum" }`
- **Statut :** `[ ]`

#### TC-AUTH-005 — Champs requis manquants
- **Données :** `{}`
- **Résultat :** ❌ HTTP 422 — Erreur de validation Zod
- **Statut :** `[ ]`

---

### 1.2 Connexion (POST /api/auth/login)

#### TC-AUTH-010 — Connexion valide
- **Prérequis :** 🗄️ TC-AUTH-001 passé
- **Données :** `{ "email": "jean.dupont@test.cm", "password": "Password123!" }`
- **Résultat :** ✅ HTTP 200 — `{ accessToken: "..." }` + cookie `refreshToken` (httpOnly)
- **Statut :** `[ ]`

#### TC-AUTH-011 — Email incorrect
- **Résultat :** ❌ HTTP 401 — `{ message: "Email ou mot de passe incorrect" }`
- **Statut :** `[ ]`

#### TC-AUTH-012 — Mot de passe incorrect
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

#### TC-AUTH-013 — Champs vides
- **Résultat :** ❌ HTTP 422
- **Statut :** `[ ]`

---

### 1.3 Refresh Token (POST /api/auth/refresh)

#### TC-AUTH-020 — Refresh valide
- **Prérequis :** 🔒 Cookie `refreshToken` valide
- **Résultat :** ✅ HTTP 200 — Nouveau `accessToken`
- **Statut :** `[ ]`

#### TC-AUTH-021 — Refresh sans cookie
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

#### TC-AUTH-022 — Token expiré / révoqué
- **Résultat :** ❌ HTTP 403
- **Statut :** `[ ]`

---

### 1.4 Déconnexion (POST /api/auth/logout)

#### TC-AUTH-030 — Déconnexion valide
- **Prérequis :** 🔒 Bearer token valide
- **Résultat :** ✅ HTTP 200 — Cookie `refreshToken` supprimé
- **Statut :** `[ ]`

---

### 1.5 Profil courant (GET /api/auth/me)

#### TC-AUTH-040 — Obtenir profil connecté
- **Prérequis :** 🔒 Bearer token valide
- **Résultat :** ✅ HTTP 200 — `{ email, firstName, lastName, role }` — champ `password` absent
- **Statut :** `[ ]`

#### TC-AUTH-041 — Sans token
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

---

## Module 2 — Hôpitaux

### 2.1 Liste (GET /api/hospitals)

#### TC-HOSP-001 — Tous les hôpitaux
- **Prérequis :** 🗄️ `npm run seed` exécuté
- **Résultat :** ✅ HTTP 200 — Tableau paginé
- **Statut :** `[ ]`

#### TC-HOSP-002 — Filtrer par ville
- **URL :** `GET /api/hospitals?city=Douala`
- **Résultat :** ✅ HTTP 200 — Hôpitaux de Douala uniquement
- **Statut :** `[ ]`

#### TC-HOSP-003 — Filtrer par type
- **URL :** `GET /api/hospitals?type=clinic`
- **Résultat :** ✅ HTTP 200 — Cliniques uniquement
- **Statut :** `[ ]`

#### TC-HOSP-004 — Pagination
- **URL :** `GET /api/hospitals?page=1&limit=2`
- **Résultat :** ✅ HTTP 200 — Max 2 résultats
- **Statut :** `[ ]`

---

### 2.2 Détail (GET /api/hospitals/:id)

#### TC-HOSP-010 — ID valide
- **Résultat :** ✅ HTTP 200 — Détails complets
- **Statut :** `[ ]`

#### TC-HOSP-011 — ID inexistant
- **URL :** `GET /api/hospitals/000000000000000000000000`
- **Résultat :** ❌ HTTP 404
- **Statut :** `[ ]`

#### TC-HOSP-012 — ID format incorrect
- **URL :** `GET /api/hospitals/invalid-id`
- **Résultat :** ❌ HTTP 400 ou 404
- **Statut :** `[ ]`

---

### 2.3 Médecins d'un hôpital (GET /api/hospitals/:id/doctors)

#### TC-HOSP-020 — Liste des médecins
- **Résultat :** ✅ HTTP 200 — Médecins avec spécialités
- **Statut :** `[ ]`

---

## Module 3 — Médecins

### 3.1 Liste (GET /api/doctors)

#### TC-DOC-001 — Tous les médecins actifs
- **Résultat :** ✅ HTTP 200 — Triés par rating décroissant
- **Statut :** `[ ]`

#### TC-DOC-002 — Filtrer par spécialité
- **URL :** `GET /api/doctors?specialtyId={id}`
- **Résultat :** ✅ HTTP 200
- **Statut :** `[ ]`

#### TC-DOC-003 — Filtrer par hôpital
- **URL :** `GET /api/doctors?hospitalId={id}`
- **Résultat :** ✅ HTTP 200
- **Statut :** `[ ]`

#### TC-DOC-004 — Pagination
- **URL :** `GET /api/doctors?page=1&limit=5`
- **Résultat :** ✅ HTTP 200 — Max 5 résultats
- **Statut :** `[ ]`

---

### 3.2 Profil (GET /api/doctors/:id)

#### TC-DOC-010 — ID valide
- **Résultat :** ✅ HTTP 200 — `{ title, firstName, lastName, specialties, hospitals, rating, consultationFee }`
- **Statut :** `[ ]`

#### TC-DOC-011 — ID inexistant
- **Résultat :** ❌ HTTP 404 — `{ message: "Médecin introuvable." }`
- **Statut :** `[ ]`

---

### 3.3 Disponibilités (GET /api/doctors/:id/availability)

#### TC-DOC-020 — Créneaux disponibles
- **URL :** `GET /api/doctors/{id}/availability?startDate=2026-04-01&endDate=2026-04-07`
- **Résultat :** ✅ HTTP 200 — `{ slots: [{ datetime, available, hospitalId }] }` — aucun créneau passé
- **Statut :** `[ ]`

#### TC-DOC-021 — Sans paramètres de date
- **Résultat :** ❌ HTTP 400
- **Statut :** `[ ]`

#### TC-DOC-022 — Médecin sans disponibilité
- **Résultat :** ✅ HTTP 200 — `{ slots: [] }`
- **Statut :** `[ ]`

---

## Module 4 — Spécialités

#### TC-SPEC-001 — Toutes les spécialités (GET /api/specialties)
- **Résultat :** ✅ HTTP 200 — 8 spécialités (Cardiologie, Neurologie, Pédiatrie…)
- **Statut :** `[ ]`

---

## Module 5 — Rendez-vous

### 5.1 Créer (POST /api/appointments)

#### TC-APT-001 — Création valide
- **Prérequis :** 🔒 Patient · 🗄️ Médecin et hôpital en BDD
- **Données :**
  ```json
  {
    "doctorId": "{doctorId}",
    "hospitalId": "{hospitalId}",
    "scheduledAt": "2026-04-05T09:00:00.000Z",
    "reason": "Consultation de suivi cardiologique"
  }
  ```
- **Résultat :** ✅ HTTP 201 — `{ reference: "MN-XXXX", status: "confirmed", duration: 30 }`
- **Vérification :** Email de confirmation mis en queue BullMQ
- **Statut :** `[ ]`

#### TC-APT-002 — Créneau déjà réservé
- **Prérequis :** TC-APT-001 passé — même créneau
- **Résultat :** ❌ HTTP 409 — `{ message: "Ce créneau n'est plus disponible." }`
- **Statut :** `[ ]`

#### TC-APT-003 — Créneau dans le passé
- **Résultat :** ❌ HTTP 400 — `{ message: "Ce créneau est déjà passé." }`
- **Statut :** `[ ]`

#### TC-APT-004 — Créneau dans moins d'1h
- **Résultat :** ❌ HTTP 400 — `{ message: "Réservez au moins 1h à l'avance." }`
- **Statut :** `[ ]`

#### TC-APT-005 — Non authentifié
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

#### TC-APT-006 — Champs requis manquants
- **Résultat :** ❌ HTTP 422
- **Statut :** `[ ]`

---

### 5.2 Mes rendez-vous (GET /api/appointments/me)

#### TC-APT-010 — Liste des RDV du patient connecté
- **Prérequis :** 🔒 Patient avec RDV créé
- **Résultat :** ✅ HTTP 200 — Médecin et hôpital populés
- **Statut :** `[ ]`

#### TC-APT-011 — Filtrer par statut
- **URL :** `GET /api/appointments/me?status=confirmed`
- **Résultat :** ✅ HTTP 200 — RDV confirmés uniquement
- **Statut :** `[ ]`

#### TC-APT-012 — Patient sans rendez-vous
- **Résultat :** ✅ HTTP 200 — `{ data: [] }`
- **Statut :** `[ ]`

---

### 5.3 Annuler (PATCH /api/appointments/:id/cancel)

#### TC-APT-020 — Annulation valide (> 2h avant)
- **Prérequis :** 🔒 Patient propriétaire · RDV confirmé dans > 2h
- **Données :** `{ "cancelReason": "Indisponible" }`
- **Résultat :** ✅ HTTP 200 — `{ status: "cancelled", cancelledBy: "patient" }`
- **Vérification :** Email d'annulation mis en queue
- **Statut :** `[ ]`

#### TC-APT-021 — Annulation < 2h avant
- **Résultat :** ❌ HTTP 400 — `{ message: "Annulation impossible moins de 2h avant le rendez-vous." }`
- **Statut :** `[ ]`

#### TC-APT-022 — RDV déjà annulé
- **Résultat :** ❌ HTTP 400 — `{ message: "Déjà annulé." }`
- **Statut :** `[ ]`

#### TC-APT-023 — Annuler RDV d'un autre patient
- **Résultat :** ❌ HTTP 403 — `{ message: "Non autorisé." }`
- **Statut :** `[ ]`

#### TC-APT-024 — RDV déjà terminé
- **Résultat :** ❌ HTTP 400 — `{ message: "Rendez-vous terminé, impossible d'annuler." }`
- **Statut :** `[ ]`

---

## Module 6 — Rate Limiting

#### TC-RATE-001 — Limite sur connexion
- **Action :** > 5 requêtes en < 15 min sur `POST /api/auth/login`
- **Résultat :** ❌ HTTP 429 + header `Retry-After`
- **Statut :** `[ ]`

#### TC-RATE-002 — Limite globale API
- **Action :** > 100 requêtes en 15 min
- **Résultat :** ❌ HTTP 429
- **Statut :** `[ ]`

---

## Module 7 — Interface Utilisateur

### 7.1 Page d'accueil

#### TC-UI-001 — Chargement initial
- **Action :** Ouvrir `http://localhost:5173`
- **Résultat :** ✅ Hero, spécialités, hôpitaux visibles — zéro erreur console
- **Statut :** `[ ]`

#### TC-UI-002 — Responsive mobile (375px)
- **Résultat :** ✅ Mise en page adaptée, navigation mobile visible
- **Statut :** `[ ]`

---

### 7.2 Page Hôpitaux (`/hospitals`)

#### TC-UI-010 — Liste des hôpitaux
- **Résultat :** ✅ Grille avec nom, ville, type affiché
- **Statut :** `[ ]`

#### TC-UI-011 — Filtre par ville
- **Action :** Saisir "Douala" dans le filtre
- **Résultat :** ✅ Hôpitaux de Douala uniquement
- **Statut :** `[ ]`

#### TC-UI-012 — Accès au détail
- **Action :** Cliquer sur un hôpital
- **Résultat :** ✅ Page `/hospitals/:id` avec médecins listés
- **Statut :** `[ ]`

---

### 7.3 Inscription / Connexion

#### TC-UI-020 — Inscription réussie
- **Résultat :** ✅ Redirection vers `/dashboard`
- **Statut :** `[ ]`

#### TC-UI-021 — Erreurs de validation formulaire
- **Action :** Soumettre le formulaire vide
- **Résultat :** ✅ Messages d'erreur sous chaque champ invalide
- **Statut :** `[ ]`

#### TC-UI-022 — Connexion réussie
- **Résultat :** ✅ Redirection vers `/dashboard`
- **Statut :** `[ ]`

#### TC-UI-023 — Mauvais mot de passe
- **Résultat :** ✅ Toast d'erreur affiché
- **Statut :** `[ ]`

---

### 7.4 Profil Médecin & Réservation

#### TC-UI-030 — Affichage profil médecin
- **Action :** Naviguer vers `/doctors/:id`
- **Résultat :** ✅ Nom, spécialités, évaluation, hôpitaux, calendrier
- **Statut :** `[ ]`

#### TC-UI-031 — Sélection créneau (connecté)
- **Prérequis :** 🔒 Connecté
- **Action :** Cliquer sur créneau vert
- **Résultat :** ✅ Modale de confirmation ouverte
- **Statut :** `[ ]`

#### TC-UI-032 — Confirmation réservation
- **Action :** Cliquer "Confirmer le rendez-vous"
- **Résultat :** ✅ Toast succès + créneau grisé
- **Statut :** `[ ]`

#### TC-UI-033 — Réservation sans être connecté
- **Résultat :** ✅ Redirection vers `/login`
- **Statut :** `[ ]`

#### TC-UI-034 — Créneau non disponible
- **Résultat :** ✅ Créneau grisé, non cliquable
- **Statut :** `[ ]`

---

### 7.5 Dashboard Patient (`/dashboard`)

#### TC-UI-040 — Accès non authentifié
- **Résultat :** ✅ Redirection vers `/login`
- **Statut :** `[ ]`

#### TC-UI-041 — Affichage rendez-vous
- **Prérequis :** 🔒 Patient avec RDV
- **Résultat :** ✅ Liste avec statut, médecin, hôpital, date
- **Statut :** `[ ]`

#### TC-UI-042 — Annulation depuis dashboard
- **Prérequis :** RDV confirmé dans > 2h
- **Résultat :** ✅ Statut passe à "annulé" + toast succès
- **Statut :** `[ ]`

#### TC-UI-043 — Bouton annuler absent sur RDV terminés
- **Résultat :** ✅ Aucun bouton "Annuler" sur `completed` / `cancelled`
- **Statut :** `[ ]`

---

### 7.6 PWA

#### TC-PWA-001 — Manifest valide
- **Action :** DevTools → Application → Manifest
- **Résultat :** ✅ Manifest chargé, icônes, `start_url = /`
- **Statut :** `[ ]`

#### TC-PWA-002 — Service Worker actif
- **Action :** DevTools → Application → Service Workers
- **Résultat :** ✅ `status: running`
- **Statut :** `[ ]`

#### TC-PWA-003 — Mode hors-ligne
- **Action :** DevTools → Network → "Offline" → Recharger
- **Résultat :** ✅ Page d'accueil depuis le cache SW
- **Statut :** `[ ]`

---

## Module 8 — Infrastructure Docker

#### TC-DOCKER-001 — Conteneurs démarrés
- **Commande :** `docker compose ps`
- **Résultat :** ✅ `mongo`, `redis`, `backend`, `frontend` tous à l'état `healthy`
- **Statut :** `[ ]`

#### TC-DOCKER-002 — Health MongoDB
- **Commande :** `docker inspect medinote_mongo --format "{{.State.Health.Status}}"`
- **Résultat :** ✅ `healthy`
- **Statut :** `[ ]`

#### TC-DOCKER-003 — Health Redis
- **Commande :** `docker inspect medinote_redis --format "{{.State.Health.Status}}"`
- **Résultat :** ✅ `healthy`
- **Statut :** `[ ]`

#### TC-DOCKER-004 — Health Backend
- **Commande :** `curl http://localhost:5000/health`
- **Résultat :** ✅ HTTP 200 — `{ status: "ok" }`
- **Statut :** `[ ]`

#### TC-DOCKER-005 — Persistance des données
- **Action :** `docker compose down` → `docker compose up -d` → vérifier BDD
- **Résultat :** ✅ Données préservées dans les volumes nommés
- **Statut :** `[ ]`

#### TC-DOCKER-006 — Proxy Apache `/api` → backend
- **Commande :** `curl http://localhost:5173/api/specialties`
- **Résultat :** ✅ HTTP 200 — Réponse JSON valide des spécialités
- **Statut :** `[ ]`

---

## Module 9 — Emails

#### TC-EMAIL-001 — Confirmation après création de RDV
- **Prérequis :** SMTP configuré + TC-APT-001 passé
- **Résultat :** ✅ Email reçu — Sujet : "Votre rendez-vous est confirmé" · Contenu : médecin, hôpital, date, référence MN-XXXX
- **Statut :** `[ ]`

#### TC-EMAIL-002 — Email d'annulation
- **Prérequis :** TC-APT-020 passé
- **Résultat :** ✅ Email reçu — Sujet : "Votre rendez-vous a été annulé"
- **Statut :** `[ ]`

#### TC-EMAIL-003 — Email de rappel 24h avant (CRON)
- **Prérequis :** RDV dans ~24h · CRON actif
- **Résultat :** ✅ Email reçu — Sujet : "Rappel: votre rendez-vous est demain"
- **Statut :** `[ ]`

---

## Module 10 — Sécurité

#### TC-SEC-001 — Route protégée sans token
- **URL :** `GET /api/appointments/me` sans `Authorization`
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

#### TC-SEC-002 — JWT expiré
- **Résultat :** ❌ HTTP 401
- **Statut :** `[ ]`

#### TC-SEC-003 — JWT falsifié
- **Résultat :** ❌ HTTP 401 — `{ message: "Token invalide" }`
- **Statut :** `[ ]`

#### TC-SEC-004 — Headers de sécurité
- **Commande :** `curl -I http://localhost:5000/api/specialties`
- **Résultat :** ✅ `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY`
- **Statut :** `[ ]`

#### TC-SEC-005 — Champ `password` masqué
- **URL :** `GET /api/auth/me`
- **Résultat :** ✅ Champ `password` absent de la réponse
- **Statut :** `[ ]`

---

## Récapitulatif

| Module | # Tests | Passés | Échoués | Bloqués |
|--------|---------|--------|---------|---------|
| 1 — Authentification | 15 | | | |
| 2 — Hôpitaux | 8 | | | |
| 3 — Médecins | 9 | | | |
| 4 — Spécialités | 1 | | | |
| 5 — Rendez-vous | 13 | | | |
| 6 — Rate Limiting | 2 | | | |
| 7 — Interface Utilisateur | 18 | | | |
| 8 — Infrastructure Docker | 6 | | | |
| 9 — Emails | 3 | | | |
| 10 — Sécurité | 5 | | | |
| **TOTAL** | **80** | | | |

---

## Outils Recommandés

| Outil | Usage |
|-------|-------|
| **Postman / Insomnia** | Tests API (modules 1–6, 10) |
| **Docker Desktop** | Vérification santé conteneurs (module 8) |
| **Chrome DevTools** | Tests PWA, responsive, réseau (module 7) |
| **MailHog** | Bac à sable SMTP local pour les emails |
| **MongoDB Compass** | Vérification des données en BDD |

> [!TIP]
> **Prérequis :** Exécuter le script de seeding avant de commencer les tests :
> ```bash
> docker compose exec backend npm run seed
> ```

> [!NOTE]
> **Tester les emails localement avec MailHog :**
> ```bash
> docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
> ```
> Configurer `.env` : `SMTP_HOST=localhost`, `SMTP_PORT=1025`.  
> Interface web accessible sur `http://localhost:8025`.
