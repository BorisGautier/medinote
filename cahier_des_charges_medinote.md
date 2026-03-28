# Cahier des Charges — Application Web de Prise de Rendez-Vous Médicaux
**Projet : MediNote**
**Version : 1.0**
**Date : 28 Mars 2026**
**Statut : En attente de validation**

---

## Table des Matières

1. [Contexte & Objectifs](#1-contexte--objectifs)
2. [Périmètre du Projet](#2-périmètre-du-projet)
3. [Acteurs & Rôles](#3-acteurs--rôles)
4. [Fonctionnalités Détaillées](#4-fonctionnalités-détaillées)
5. [Architecture Technique](#5-architecture-technique)
6. [Modèle de Données](#6-modèle-de-données)
7. [Exigences Non-Fonctionnelles](#7-exigences-non-fonctionnelles)
8. [Maquettes Conceptuelles (Wireframes)](#8-maquettes-conceptuelles-wireframes)
9. [Phases de Livraison & Planning](#9-phases-de-livraison--planning)
10. [Critères d'Acceptance](#10-critères-dacceptance)
11. [Risques & Mitigations](#11-risques--mitigations)
12. [Glossaire](#12-glossaire)

---

## 1. Contexte & Objectifs

### 1.1 Contexte

La prise de rendez-vous médicaux reste un processus souvent fastidieux : appels téléphoniques, longues attentes, manque de visibilité sur les disponibilités des praticiens. Les hôpitaux et cliniques peinent à optimiser le remplissage de leurs calendriers et les patients perdent du temps à chercher le bon spécialiste.

**MediNote** est une plateforme web centralisée permettant aux patients de trouver facilement un médecin selon sa spécialité et son hôpital, de consulter ses disponibilités en temps réel, et de réserver un rendez-vous en quelques clics — le tout avec une confirmation automatique par e-mail.

### 1.2 Objectifs Principaux

| # | Objectif | Indicateur de Succès |
|---|----------|----------------------|
| O1 | Réduire le temps de prise de RDV | < 3 minutes du début à la confirmation |
| O2 | Améliorer la visibilité des médecins | 100 % des médecins référencés listés avec dispo en temps réel |
| O3 | Diminuer les appels téléphoniques | Réduction de 60 % des prises de RDV par téléphone |
| O4 | Réduire le taux d'absentéisme | Rappels automatiques par e-mail 24h avant le RDV |
| O5 | Garantir la conformité RGPD/données de santé | Audit de conformité réussi avant la mise en production |

---

## 2. Périmètre du Projet

### 2.1 Inclus dans le périmètre (V1)

- ✅ Annuaire des médecins par hôpital et spécialité
- ✅ Affichage des disponibilités (créneaux libres)
- ✅ Prise de rendez-vous en ligne
- ✅ Confirmation de RDV par e-mail (patient + médecin)
- ✅ Rappel automatique 24h avant le RDV
- ✅ Gestion du compte patient (inscription, connexion, historique)
- ✅ Interface d'administration (back-office médecin / hôpital)
- ✅ Tableau de bord admin super-utilisateur

### 2.2 Hors périmètre (versions futures)

- ❌ Paiement en ligne des consultations
- ❌ Téléconsultation / vidéo-conférence
- ❌ Intégration avec les DSE (Dossiers de Santé Électroniques)
- ❌ Application mobile native (iOS / Android)
- ❌ Notifications SMS / WhatsApp
- ❌ IA de recommandation de spécialiste

---

## 3. Acteurs & Rôles

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACTEURS DU SYSTÈME                        │
├──────────────────┬──────────────────┬───────────────────────────┤
│     PATIENT       │     MÉDECIN      │      ADMINISTRATEUR        │
│  (Utilisateur)    │   (Praticien)    │   (Hôpital / Super-Admin) │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### 3.1 Patient (Utilisateur final)
- Recherche et consulte les profils des médecins
- S'inscrit, se connecte, gère son profil
- Prend, modifie et annule des rendez-vous
- Reçoit des e-mails de confirmation et de rappel

### 3.2 Médecin (Praticien)
- Gère son profil (photo, bio, spécialité, tarifs)
- Définit ses plages horaires et disponibilités
- Consulte et gère son agenda de rendez-vous
- Reçoit une notification e-mail à chaque nouveau RDV

### 3.3 Administrateur Hôpital
- Gère le profil de l'hôpital (nom, adresse, photo, services)
- Rattache des médecins à l'institution
- Consulte les statistiques d'utilisation de l'établissement

### 3.4 Super-Administrateur (Plateforme)
- Gère tous les hôpitaux, médecins et patients
- Accède aux tableaux de bord globaux
- Configure les paramètres système (spécialités, e-mails, etc.)

---

## 4. Fonctionnalités Détaillées

### 4.1 Module Annuaire & Recherche

#### 4.1.1 Liste des Hôpitaux

**Description** : Page d'entrée permettant au patient de parcourir tous les établissements de santé référencés.

**Comportement attendu :**
- Affichage en grille/liste des hôpitaux avec : nom, photo, ville, nombre de médecins, spécialités disponibles
- Filtres : ville, région, type d'établissement (hôpital public, clinique privée, centre de santé)
- Barre de recherche full-text en temps réel (nom ou ville)
- Pagination ou défilement infini (25 hôpitaux par page)
- Lien vers la page détail d'un hôpital

**Données affichées par hôpital :**
```
📍 Hôpital Central de Yaoundé
   Ville : Yaoundé | Type : Hôpital Public
   Spécialités : Cardiologie, Pédiatrie, Neurologie (+5)
   👨‍⚕️ 34 médecins disponibles
   [Voir les médecins →]
```

#### 4.1.2 Liste des Médecins par Hôpital

**Description** : Page listant tous les médecins d'un hôpital donné, avec filtrage par spécialité.

**Comportement attendu :**
- En-tête avec les informations de l'hôpital (nom, adresse, contact, photo)
- Filtres par spécialité (tabs ou dropdown)
- Tri : pertinence, nom A-Z, prochaine disponibilité
- Carte médecin : photo, nom, spécialité, sous-spécialité, tarif consultation, note moyenne, prochains créneaux disponibles
- Indicateur de disponibilité : 🟢 Disponible aujourd'hui / 🟡 Cette semaine / 🔴 Complet

**Règles métier :**
- Un médecin peut appartenir à plusieurs hôpitaux
- Un médecin peut avoir plusieurs spécialités (ex. : Pédiatre & Néonatologue)
- Si aucun créneau disponible dans les 30 prochains jours → afficher "Liste d'attente"

#### 4.1.3 Profil Médecin

**Description** : Page de détail d'un médecin.

**Contenu du profil :**
| Section | Contenu |
|---------|---------|
| Identité | Photo, Nom, Titre, Numéro d'ordre |
| Spécialités | Badge(s) de spécialité |
| Biographie | Présentation, formations, expériences |
| Établissements | Hôpitaux où il consulte |
| Tarifs | Consultation standard, suivi, actes |
| Langues | Langues parlées |
| Disponibilités | Calendrier interactif (voir §4.2) |
| Avis | Notes et commentaires des patients |

---

### 4.2 Module Disponibilités

**Description** : Calendrier interactif affichant les créneaux horaires libres d'un médecin.

**Comportement attendu :**
- Vue semaine par défaut (avec navigation semaine précédente/suivante)
- Créneaux affichés en blocs de 15, 20 ou 30 minutes (configurable par médecin)
- Code couleur :
  - 🟩 Créneau libre → cliquable → déclenche la prise de RDV
  - 🟥 Créneau réservé → non cliquable + tooltip "Déjà réservé"
  - ⬜ Hors horaires → grisé
- Fuseau horaire : adaptive selon la localisation de l'utilisateur
- Possibilité de filtrer par hôpital si le médecin consulte dans plusieurs établissements

**Règles métier :**
- Un créneau est verrouillé pendant 10 minutes lors d'une tentative de réservation (éviter les doubles réservations)
- Un patient ne peut pas prendre plus de 2 RDV simultanés avec le même médecin
- Minimum 1h avant le RDV pour la prise en ligne (sinon : appel direct recommandé)

---

### 4.3 Module Prise de Rendez-Vous

**Description** : Tunnel de réservation en 3 étapes guidées.

#### Étape 1 — Sélection du créneau
- Confirmation visuelle du créneau sélectionné
- Affichage du médecin, hôpital, date, heure, durée estimée

#### Étape 2 — Informations patient
- Si non connecté : formulaire d'inscription rapide ou connexion
- Si connecté : pré-remplissage des données du profil
- Champs : prénom, nom, date de naissance, téléphone, motif de la consultation (obligatoire), documents à joindre (optionnel, PDF/image < 5 Mo)

#### Étape 3 — Confirmation
- Récapitulatif complet du RDV
- Bouton "Confirmer la réservation"
- Affichage d'un message de succès + numéro de référence unique
- Envoi automatique de l'e-mail de confirmation (voir §4.4)

**États d'un RDV :**
```
[PENDING] → [CONFIRMED] → [COMPLETED]
                       ↘ [CANCELLED]
                       ↘ [NO_SHOW]
```

---

### 4.4 Module Notifications Email

#### 4.4.1 Email de Confirmation Patient

**Déclencheur** : Immédiatement après confirmation d'un RDV

**Contenu de l'e-mail :**
```
Objet : ✅ Votre RDV avec Dr. [Nom] est confirmé — [Date]

Bonjour [Prénom],

Votre rendez-vous a bien été enregistré. Voici les détails :

┌─────────────────────────────────────────┐
│  👨‍⚕️  Dr. Jean-Pierre Mballa              │
│  🏥  Hôpital Central de Yaoundé         │
│  🗓️   Jeudi 2 Avril 2026 à 14h30        │
│  ⏱️   Durée estimée : 30 minutes         │
│  📋  Motif : Consultation générale       │
│  🔖  Référence : RDV-2026-00842          │
└─────────────────────────────────────────┘

📍 Adresse : Avenue Kennedy, Yaoundé, Cameroun

⚠️  Annulation : Possible jusqu'à 2h avant le RDV
    via votre espace patient ou en appelant le +237 6XX XXX XXX

[Gérer mon RDV] [Ajouter à mon calendrier (ICS)]

Cordialement,
L'équipe MediNote
```

#### 4.4.2 Email de Rappel Patient

**Déclencheur** : 24h avant le RDV (tâche CRON planifiée)

**Contenu** : Même structure que la confirmation + CTA "Annuler si empêché"

#### 4.4.3 Email de Notification Médecin

**Déclencheur** : À chaque nouveau RDV confirmé

**Contenu** : Nom du patient, motif, créneau, coordonnées de contact

#### 4.4.4 Email d'Annulation

**Déclencheur** : Patient ou médecin annule un RDV

**Contenu** : Détails du RDV annulé + invitation à reprendre un RDV

---

### 4.5 Module Compte Patient

| Fonctionnalité | Description |
|----------------|-------------|
| Inscription | Email + mot de passe ou OAuth (Google) |
| Connexion | Email/mdp + 2FA optionnel |
| Profil | Informations personnelles, photo |
| Mes RDV | Historique passé + à venir, annulation |
| Documents | Téléchargements liés aux consultations |
| Préférences | Langue, notifications |

---

### 4.6 Module Back-Office Médecin

| Fonctionnalité | Description |
|----------------|-------------|
| Profil | Modifier ses informations, photo |
| Agenda | Vue calendrier de ses RDV |
| Disponibilités | Définir ses créneaux hebdomadaires récurrents + exceptions |
| Patients | Liste des patients ayant eu un RDV |
| Statistiques | Nb de RDV par mois, taux d'annulation |
| Congés | Marquer des périodes d'indisponibilité |

---

### 4.7 Module Administration

| Fonctionnalité | Description |
|----------------|-------------|
| Gestion hôpitaux | CRUD des établissements |
| Gestion médecins | CRUD des praticiens, rattachement hôpital |
| Gestion spécialités | CRUD du référentiel de spécialités médicales |
| Gestion patients | Consultation, désactivation |
| Tableau de bord | KPIs globaux, graphiques |
| Paramètres | Config emails, règles métier |

---

## 5. Architecture Technique

### 5.1 Stack Technologique Recommandée

#### Frontend
```
Framework    : React.js 18+ (avec Vite)
UI Library   : Shadcn/UI + Tailwind CSS
State Mgmt   : Zustand ou React Query (TanStack)
Formulaires  : React Hook Form + Zod
Calendrier   : FullCalendar.io ou react-big-calendar
HTTP Client  : Axios
Auth         : JWT stocké en httpOnly cookie
```

#### Backend
```
Runtime      : Node.js 20 LTS
Framework    : Express.js ou NestJS (recommandé pour la structure)
ORM          : Prisma
Base SQL     : PostgreSQL 16
Cache        : Redis (gestion des créneaux verrouillés, sessions)
Queue        : Bull (emails asynchrones)
Auth         : Passport.js + JWT + bcrypt
Emails       : Nodemailer + Mailgun / SendGrid
Fichiers     : AWS S3 ou Cloudinary (documents patients)
```

#### Infrastructure
```
Hébergement  : Google Cloud Run (backend API)
              Vercel ou Firebase Hosting (frontend)
BDD          : Google Cloud SQL (PostgreSQL)
Cache        : Redis Cloud ou Upstash
CDN          : Cloudflare (assets statiques)
CI/CD        : GitHub Actions
```

### 5.2 Architecture Globale

```
┌─────────────┐    HTTPS     ┌──────────────────────────┐
│   Patient   │◄────────────►│     Frontend React        │
│   Médecin   │              │    (Vercel / Hosting)     │
│    Admin    │              └─────────────┬────────────┘
└─────────────┘                            │ API REST
                                           ▼
                              ┌──────────────────────────┐
                              │     Backend NestJS        │
                              │    (Google Cloud Run)     │
                              └──────┬──────────┬─────────┘
                                     │          │
                              ┌──────▼──┐  ┌────▼─────┐
                              │PostgreSQL│  │  Redis   │
                              │(Prisma)  │  │(Sessions)│
                              └──────────┘  └──────────┘
                                                │
                              ┌─────────────────▼────────┐
                              │   Bull Queue (Emails)     │
                              │   → SendGrid / Mailgun   │
                              └──────────────────────────┘
```

### 5.3 API REST — Endpoints Principaux

```
# Hôpitaux
GET    /api/hospitals                  → Liste tous les hôpitaux
GET    /api/hospitals/:id              → Détail d'un hôpital
GET    /api/hospitals/:id/doctors      → Médecins d'un hôpital

# Médecins
GET    /api/doctors                    → Liste tous les médecins
GET    /api/doctors/:id                → Profil d'un médecin
GET    /api/doctors/:id/availability   → Créneaux disponibles

# Spécialités
GET    /api/specialties                → Liste des spécialités

# Rendez-Vous
POST   /api/appointments               → Créer un RDV
GET    /api/appointments/:id           → Détail d'un RDV
PUT    /api/appointments/:id/cancel    → Annuler un RDV
GET    /api/appointments/patient/me    → RDV du patient connecté

# Authentification
POST   /api/auth/register              → Inscription
POST   /api/auth/login                 → Connexion
POST   /api/auth/logout                → Déconnexion
GET    /api/auth/me                    → Profil courant
```

---

## 6. Modèle de Données

### 6.1 Diagramme Entité-Relation (simplifié)

```
Hospital ─────────────────< HospitalDoctor >───────────────── Doctor
   │                                                              │
   │ 1                                                            │ 1
   │                                                              │
   ▼ *                                                            ▼ *
Appointment <─────────────────────────────────────────────── Availability
   │                                                     (plages horaires)
   │ *
   │
   ▼ 1
 Patient                                   Specialty
                                               │
                                               │ *
                                               │
                                         DoctorSpecialty
```

### 6.2 Tables Principales

#### `hospitals`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(255) | Nom de l'établissement |
| type | ENUM | public / private / clinic |
| address | TEXT | Adresse complète |
| city | VARCHAR(100) | Ville |
| region | VARCHAR(100) | Région |
| phone | VARCHAR(20) | Téléphone |
| email | VARCHAR(255) | E-mail de contact |
| photo_url | TEXT | URL de la photo |
| is_active | BOOLEAN | Actif/Inactif |
| created_at | TIMESTAMP | Date de création |

#### `doctors`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | FK → users |
| title | VARCHAR(50) | Dr., Pr., etc. |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| license_number | VARCHAR(100) | Numéro d'ordre |
| bio | TEXT | Biographie |
| photo_url | TEXT | Photo de profil |
| consultation_fee | DECIMAL(10,2) | Tarif consultation |
| languages | ARRAY | Langues parlées |
| is_active | BOOLEAN | Actif/Inactif |

#### `specialties`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(100) | Ex: "Cardiologie" |
| slug | VARCHAR(100) | Ex: "cardiologie" |
| description | TEXT | Description |
| icon | VARCHAR(50) | Icône (emoji ou classe) |

#### `availabilities`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| doctor_id | UUID | FK → doctors |
| hospital_id | UUID | FK → hospitals |
| day_of_week | ENUM | mon/tue/wed/thu/fri/sat/sun |
| start_time | TIME | Heure début |
| end_time | TIME | Heure fin |
| slot_duration | INTEGER | Durée créneaux en minutes |
| is_recurring | BOOLEAN | Récurrent ou ponctuel |
| valid_from | DATE | Date de début de validité |
| valid_until | DATE | Date de fin de validité |

#### `appointments`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| reference | VARCHAR(20) | Ex: RDV-2026-00842 |
| patient_id | UUID | FK → patients |
| doctor_id | UUID | FK → doctors |
| hospital_id | UUID | FK → hospitals |
| scheduled_at | TIMESTAMP | Date et heure du RDV |
| duration | INTEGER | Durée en minutes |
| reason | TEXT | Motif de consultation |
| status | ENUM | pending/confirmed/cancelled/completed/no_show |
| cancelled_by | ENUM | patient / doctor / admin |
| cancel_reason | TEXT | Motif d'annulation |
| notes | TEXT | Notes internes médecin |
| created_at | TIMESTAMP | Date de création |

#### `patients`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | FK → users |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| date_of_birth | DATE | Date de naissance |
| gender | ENUM | male/female/other |
| phone | VARCHAR(20) | Téléphone |
| blood_group | VARCHAR(5) | Groupe sanguin |

---

## 7. Exigences Non-Fonctionnelles

### 7.1 Performance

| Critère | Objectif |
|---------|----------|
| Temps de chargement page | < 2 secondes (LCP) |
| Temps de réponse API | < 300 ms (p95) |
| Disponibilité | 99,5 % (hors maintenance planifiée) |
| Capacité | Support de 10 000 utilisateurs simultanés (v1) |
| Envoi email | < 2 min après confirmation |

### 7.2 Sécurité

- **Authentification** : JWT avec refresh token, httpOnly cookies, expiration 15 min
- **Mots de passe** : Hachage bcrypt (cost factor 12)
- **HTTPS** : Obligatoire sur tous les endpoints
- **CORS** : Restreint aux domaines autorisés
- **Rate Limiting** : 100 req / 15 min par IP pour les endpoints publics
- **Validation** : Toutes les entrées validées côté serveur (Zod/Joi)
- **Données sensibles** : Chiffrement des données de santé (AES-256)
- **Conformité** : RGPD — droit à l'oubli, consentement explicite, registre des traitements

### 7.3 Accessibilité

- Conformité WCAG 2.1 niveau AA
- Navigation clavier complète
- Lecteur d'écran compatible (aria-labels)
- Contraste des couleurs > 4.5:1
- Texte redimensionnable jusqu'à 200 %

### 7.4 Compatibilité

| Navigateur | Version minimale |
|------------|-----------------|
| Chrome | 110+ |
| Firefox | 110+ |
| Safari | 16+ |
| Edge | 110+ |
| Mobile (iOS Safari) | 16+ |
| Mobile (Chrome Android) | 110+ |

### 7.5 Internationalisation

- Langue par défaut : **Français**
- Architecture i18n prête (support futur : Anglais, Langues locales)
- Formats de date : DD/MM/YYYY
- Fuseau horaire : Configurable par utilisateur

---

## 8. Maquettes Conceptuelles (Wireframes)

### 8.1 Page d'Accueil

```
┌────────────────────────────────────────────────────┐
│  🏥 MediNote           [Connexion] [S'inscrire]    │
├────────────────────────────────────────────────────┤
│                                                    │
│   Prenez rendez-vous avec le bon médecin          │
│   ─────────────────────────────────────           │
│   🔍 [Spécialité ou médecin...]  [📍 Ville →]  [Chercher] │
│                                                    │
├────────────────────────────────────────────────────┤
│  Spécialités populaires                            │
│  [🫀 Cardiologie] [🧠 Neurologie] [👶 Pédiatrie]  │
│  [🦷 Dentisterie] [👁️ Ophtalmologie] [+ voir tout] │
├────────────────────────────────────────────────────┤
│  Hôpitaux partenaires                              │
│  [Carte Hôpital 1] [Carte Hôpital 2] [Carte 3]   │
└────────────────────────────────────────────────────┘
```

### 8.2 Page Médecin (avec Disponibilités)

```
┌──────────────────────────────────────────────────────┐
│  ← Retour                                            │
│  ┌──────┐  Dr. Jean-Pierre Mballa                   │
│  │Photo │  🏥 Cardiologue | Hôpital Central         │
│  └──────┘  ⭐ 4.8/5 (124 avis) | 15 000 XAF        │
│                                                      │
│  Disponibilités — Avril 2026                        │
│  ┌──┬──┬──┬──┬──┬──┬──┐                            │
│  │Lu│Ma│Me│Je│Ve│Sa│Di│                            │
│  ├──┼──┼──┼──┼──┼──┼──┤                            │
│  │🟩│🟥│🟩│🟩│🟥│  │  │ ← 09:00                  │
│  │🟥│🟥│🟩│🟩│🟩│  │  │ ← 09:30                  │
│  │🟩│🟩│🟥│🟥│🟩│  │  │ ← 10:00                  │
│  └──┴──┴──┴──┴──┴──┴──┘                            │
│                          [Prendre ce RDV →]         │
└──────────────────────────────────────────────────────┘
```

### 8.3 Tunnel de Réservation

```
  ① Créneau  →  ② Vos infos  →  ③ Confirmation
  ──────────────────────────────────────────────
  ✅ Créneau sélectionné :
  Dr. Mballa — Jeudi 2 Avril à 14h30

  Motif de consultation *
  [________________________]

  Prénom *        Nom *
  [_________]     [_________]

  Email *                  Téléphone *
  [___________________]    [____________]

  Joindre un document (optionnel) : [📎 Parcourir]

  [← Retour]           [Confirmer le RDV →]
```

---

## 9. Phases de Livraison & Planning

### Phase 1 — Fondations (Semaines 1-3)
- [ ] Mise en place du projet (monorepo, CI/CD, environnements)
- [ ] Conception et migration base de données (Prisma + Postgres)
- [ ] Authentification complète (inscription, connexion, JWT)
- [ ] API : hôpitaux, médecins, spécialités (CRUD)

### Phase 2 — Disponibilités & RDV (Semaines 4-6)
- [ ] Système de disponibilités (agenda médecin)
- [ ] Verrouillage temporaire de créneaux (Redis)
- [ ] API de prise de RDV
- [ ] Gestion des états du RDV (confirmed, cancelled, etc.)

### Phase 3 — Notifications & Emails (Semaine 7)
- [ ] Intégration SendGrid / Mailgun
- [ ] Templates d'emails HTML (confirmation, rappel, annulation)
- [ ] Queue de traitement asynchrone (Bull)
- [ ] CRON job pour les rappels 24h

### Phase 4 — Frontend (Semaines 4-9, en parallèle)
- [ ] Design system & composants UI
- [ ] Pages publiques (accueil, hôpitaux, médecins, profil)
- [ ] Calendrier de disponibilités interactif
- [ ] Tunnel de réservation (3 étapes)
- [ ] Espace patient (profil, historique)
- [ ] Back-office médecin
- [ ] Tableau de bord admin

### Phase 5 — Tests & Sécurité (Semaines 10-11)
- [ ] Tests unitaires backend (Jest)
- [ ] Tests end-to-end (Playwright ou Cypress)
- [ ] Audit de sécurité (OWASP Top 10)
- [ ] Audit RGPD
- [ ] Tests de charge (k6)

### Phase 6 — Déploiement & Mise en Production (Semaine 12)
- [ ] Déploiement staging
- [ ] Recette utilisateur (UAT)
- [ ] Déploiement production
- [ ] Monitoring (Sentry, Grafana)
- [ ] Documentation technique et utilisateur

### 📅 Estimation Globale

| Phase | Durée | Ressources |
|-------|-------|------------|
| Fondations | 3 semaines | 1 back-end dev |
| Disponibilités & RDV | 3 semaines | 1 back-end dev |
| Notifications | 1 semaine | 1 back-end dev |
| Frontend | 6 semaines | 1-2 front-end dev |
| Tests & Sécurité | 2 semaines | 1 QA + devs |
| Déploiement | 1 semaine | DevOps |
| **TOTAL** | **~12 semaines** | **2-3 devs** |

---

## 10. Critères d'Acceptance

### 10.1 Fonctionnels

| ID | Critère | Priorité |
|----|---------|----------|
| CA-01 | Un patient peut rechercher un médecin par spécialité et hôpital | 🔴 Critique |
| CA-02 | Les créneaux disponibles s'affichent en temps réel | 🔴 Critique |
| CA-03 | Un patient peut prendre un RDV en moins de 3 minutes | 🔴 Critique |
| CA-04 | Un e-mail de confirmation est reçu dans les 2 minutes | 🔴 Critique |
| CA-05 | Un rappel est envoyé 24h avant chaque RDV | 🟠 Haute |
| CA-06 | Un patient peut annuler un RDV depuis son espace | 🟠 Haute |
| CA-07 | Un médecin peut gérer ses disponibilités | 🟠 Haute |
| CA-08 | Deux patients ne peuvent pas réserver le même créneau | 🔴 Critique |
| CA-09 | L'admin peut ajouter/modifier/supprimer hôpitaux et médecins | 🟠 Haute |
| CA-10 | L'application répond en < 2 secondes sur 4G | 🟡 Moyenne |

---

## 11. Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Double réservation simultanée | Élevée | Critique | Verrouillage Redis + transaction DB atomique |
| Spam d'e-mails (abus formulaire) | Moyenne | Haute | Rate limiting + CAPTCHA + validation email |
| Non-conformité RGPD | Faible | Critique | Audit RGPD dès la phase de conception |
| Scalabilité si adoption rapide | Faible | Haute | Architecture Cloud Run auto-scalable |
| Indisponibilité service email | Faible | Haute | Dual provider (SendGrid + Mailgun en fallback) |
| Données médicales sensibles | Moyenne | Critique | Chiffrement AES-256, accès RBAC strict |

---

## 12. Glossaire

| Terme | Définition |
|-------|------------|
| **RDV** | Rendez-vous médical |
| **Créneau** | Plage horaire disponible pour une consultation |
| **Disponibilité** | Ensemble des créneaux définis par un médecin |
| **Spécialité** | Domaine médical d'expertise d'un praticien |
| **Back-office** | Interface de gestion réservée aux médecins et admins |
| **RGPD** | Règlement Général sur la Protection des Données |
| **JWT** | JSON Web Token — mécanisme d'authentification |
| **CRON** | Tâche planifiée s'exécutant à intervalles réguliers |
| **Queue** | File d'attente pour le traitement asynchrone des emails |
| **UAT** | User Acceptance Testing — tests de recette utilisateur |

---

*Document rédigé par Antigravity AI — MediNote v1.0*
*Dernière mise à jour : 28 Mars 2026*
