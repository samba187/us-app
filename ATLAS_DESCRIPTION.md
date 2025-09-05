# Description de l'application "US" pour MongoDB Atlas

## 📱 Nom de l'application
**US - Notre App de Couple**

## 🎯 Description courte
Application privée et intime pour couples, centralisant rappels, restaurants, activités, wishlist, photos et notes dans une PWA installable.

## 📋 Description complète

### Concept
**US** est une Progressive Web App (PWA) conçue spécialement pour les couples souhaitant organiser et partager leur vie à deux de manière privée et intuitive. L'application centralise tous les aspects importants de la vie de couple dans une interface moderne et installable sur mobile.

### Fonctionnalités principales

#### 🗓️ Rappels & Organisation
- Système de rappels mutuels avec niveaux de priorité (urgent, important, normal)
- Assignation des tâches à l'un ou l'autre partenaire
- Dates d'échéance et notifications
- Statuts de suivi (en cours, terminé)

#### 🍽️ Restaurants & Gastronomie
- Liste collaborative des restaurants à découvrir
- Système de statuts : "À tester", "Testé", "Coup de cœur"
- Notes et avis après chaque visite
- Intégration Google Maps et photos
- Historique des sorties culinaires

#### 🎡 Activités & Sorties
- Planification d'activités par catégories (romantique, fun, sport, culture, voyage)
- Statuts : Idée, Prévue, Réalisée
- Notes et souvenirs pour chaque activité
- Inspiration et découverte de nouvelles expériences

#### 🎁 Wishlist & Cadeaux
- Idées cadeaux pour chaque partenaire
- Statuts de suivi : Idée, Acheté, Offert
- Liens vers les produits et descriptions détaillées
- Surprises et attentions organisées

#### 📸 Photos & Souvenirs
- Album photo commun sécurisé
- Légendes et commentaires sur les photos
- Organisation chronologique des souvenirs
- Galerie responsive avec zoom

#### 🗒️ Notes & Post-it
- Notes rapides partagées
- Système d'épinglage pour les notes importantes
- Édition collaborative en temps réel
- Post-it numériques colorés

### Spécificités techniques

#### Architecture moderne
- **Backend** : Python Flask avec MongoDB
- **Frontend** : React 18 avec Styled Components
- **PWA** : Service Worker et Web App Manifest
- **Mobile-First** : Design responsive optimisé mobile

#### Sécurité & Confidentialité
- Authentification JWT sécurisée
- Chiffrement des mots de passe (bcrypt)
- Accès privé limité au couple
- Données hébergées sur MongoDB Atlas

#### Expérience utilisateur
- Interface intuitive et moderne
- Navigation optimisée mobile (bottom navigation)
- Animations fluides et interactions tactiles
- Mode hors ligne intelligent
- Installation native sur iOS/Android

### Modèle de données MongoDB

#### Collections principales :
- **users** : Profils des partenaires (2 utilisateurs max)
- **reminders** : Rappels et tâches partagées
- **restaurants** : Liste des restaurants et avis
- **activities** : Activités planifiées et réalisées
- **wishlist_items** : Idées cadeaux et souhaits
- **photos** : Album photo commun
- **notes** : Notes rapides et post-it
- **memories** : Journal de couple et événements marquants

#### Collections secondaires :
- **albums** : Organisation des photos
- **comments** : Commentaires sur les éléments
- **reactions** : Réactions emoji
- **settings** : Préférences utilisateurs

### Avantages concurrentiels

#### 🔒 Privacy-First
- Application 100% privée (seulement 2 utilisateurs)
- Aucune donnée partagée avec des tiers
- Contrôle total sur les informations personnelles

#### 📱 Mobile Native Experience
- PWA installable comme une vraie app
- Fonctionnement hors ligne
- Notifications push intégrées
- Optimisation iOS et Android

#### 💕 Couple-Centric Design
- Interface pensée pour la collaboration
- Fonctionnalités spécifiques aux couples
- Design romantique et moderne
- Gamification des activités à deux

#### 🚀 Technologies modernes
- Performance optimisée
- Mises à jour automatiques
- Synchronisation temps réel
- Sécurité de niveau entreprise

### Cas d'usage types

1. **Organisation quotidienne** : "N'oublie pas de prendre le pain", "RDV médecin mardi"
2. **Découvertes culinaires** : "Ce restaurant italien a l'air génial", "Le sushi d'hier était parfait ⭐⭐⭐⭐⭐"
3. **Planification sorties** : "Weekend à la montagne", "Exposition au Louvre"
4. **Idées cadeaux** : "Elle aimerait cette montre", "Anniversaire dans 1 mois"
5. **Souvenirs** : Photos de vacances, moments marquants, anecdotes
6. **Communication** : Notes rapides, petits mots doux, listes de courses

### Public cible

- **Couples** de tous âges cherchant à mieux s'organiser
- **Utilisateurs technophiles** appréciant les apps modernes
- **Personnes valorisant la privacy** et l'intimité numérique
- **Couples à distance** ayant besoin d'outils de coordination
- **Familles** souhaitant une alternative privée aux apps grand public

### Différenciation

Contrairement aux applications généralistes (Todoist, Google Keep, etc.), **US** est spécifiquement conçue pour les couples avec :
- Interface optimisée pour 2 utilisateurs
- Fonctionnalités couple-centric (wishlist cadeaux, restaurants à deux, etc.)
- Privacy totale (pas de social, pas de partage externe)
- Design romantique et personnel
- Installation PWA pour une expérience native

L'application comble le vide entre les outils professionnels (trop complexes) et les réseaux sociaux (trop publics) en offrant un espace numérique intime et fonctionnel pour les couples modernes.

---

**Technologies utilisées :**
- Frontend : React 18, Styled Components, PWA
- Backend : Python Flask, JWT, bcrypt
- Database : MongoDB Atlas
- Hosting : Vercel (frontend) + Heroku (backend)
- Mobile : PWA installable iOS/Android
