# US - Notre App de Couple ❤️

Une application privée et intime pour vous deux, centralisant tout ce qui compte dans votre vie de couple.

## 🌟 Fonctionnalités

### 🗓️ **Rappels & Organisation**
- Rappels mutuels avec priorités (urgent, important, normal)
- Statuts de suivi (en cours, terminé)
- Dates d'échéance optionnelles
- Assignation à l'un ou l'autre

### 🍽️ **Restaurants**
- Liste des restaurants à tester
- Statuts : À tester / Testé / Coup de cœur
- Notes et avis après chaque visite
- Adresses et liens Google Maps
- Photos des plats/ambiance

### 🎡 **Activités & Sorties**
- Activités à faire ensemble par catégories
- Catégories : Fun, Romantique, Sport, Culture, Voyage, Autre
- Statuts : Idée / Prévue / Faite
- Historique de vos sorties

### 🎁 **Wishlist & Cadeaux**
- Idées cadeaux pour l'un et l'autre
- Statuts : Idée / Acheté / Offert
- Liens vers les produits
- Photos et descriptions

### 📸 **Photos & Souvenirs**
- Album photo commun
- Légendes pour chaque photo
- Galerie organisée par date
- Visualisation en plein écran

### 🗒️ **Notes Rapides**
- Post-it numériques
- Épinglage des notes importantes
- Édition en temps réel
- Organisation chronologique

## 🚀 **PWA (Progressive Web App)**

L'application est conçue comme une PWA, ce qui signifie :
- ✅ Installation sur l'écran d'accueil (iOS/Android)
- ✅ Fonctionnement hors ligne (cache intelligent)
- ✅ Notifications push (à venir)
- ✅ Interface native sur mobile
- ✅ Chargement ultra-rapide

## 🛠️ **Technologies Utilisées**

### Backend (Python Flask)
- **Flask** - Framework web léger et puissant
- **MongoDB** - Base de données NoSQL flexible
- **PyMongo** - Driver MongoDB pour Python
- **Flask-CORS** - Gestion des requêtes cross-origin
- **JWT** - Authentification sécurisée
- **bcrypt** - Hashage des mots de passe

### Frontend (React)
- **React 18** - Library moderne pour l'UI
- **React Router** - Navigation SPA
- **Styled Components** - CSS-in-JS pour le styling
- **Axios** - Client HTTP pour l'API
- **React Icons** - Bibliothèque d'icônes
- **Framer Motion** - Animations fluides

### PWA & Mobile
- **Service Worker** - Cache et fonctionnement hors ligne
- **Web App Manifest** - Installation sur mobile
- **Responsive Design** - Adaptatif tous écrans
- **Touch Gestures** - Interactions tactiles optimisées

## 📦 **Installation & Déploiement**

### Prérequis
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account

### Installation Backend

\`\`\`bash
cd backend
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials MongoDB
\`\`\`

### Installation Frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

### Lancement en développement

**Backend :**
\`\`\`bash
cd backend
python app.py
# Serveur sur http://localhost:5000
\`\`\`

**Frontend :**
\`\`\`bash
cd frontend
npm start
# App sur http://localhost:3000
\`\`\`

### Build de production

\`\`\`bash
cd frontend
npm run build
\`\`\`

## 🔧 **Configuration MongoDB**

### Étapes de configuration :

1. **Créer un cluster MongoDB Atlas**
   - Aller sur [MongoDB Atlas](https://cloud.mongodb.com/)
   - Créer un nouveau cluster gratuit

2. **Configurer l'accès**
   - Ajouter votre IP dans Network Access
   - Créer un utilisateur avec droits lecture/écriture

3. **Récupérer la chaîne de connexion**
   - Format : \`mongodb+srv://dbadmin:<password>@cluster0.bnefbon.mongodb.net/us_app\`
   - Remplacer \`<password>\` par votre mot de passe

4. **Collections créées automatiquement :**
   - \`users\` - Comptes utilisateurs (vous deux)
   - \`reminders\` - Rappels et tâches
   - \`restaurants\` - Liste des restaurants
   - \`activities\` - Activités et sorties
   - \`wishlist_items\` - Idées cadeaux
   - \`photos\` - Photos et souvenirs
   - \`notes\` - Notes rapides

## 🎨 **Design & Interface**

### Couleurs principales :
- **Primary** : #ff6b8a (Rose doux)
- **Secondary** : #4ecdc4 (Turquoise)
- **Accent** : #45b7d1 (Bleu ciel)
- **Background** : #f8f9fa (Blanc cassé)

### Typography :
- **Font** : Inter (Google Fonts)
- **Weights** : 300, 400, 500, 600, 700

### Mobile First :
- Design pensé mobile d'abord
- Navigation en bas d'écran
- Interactions tactiles optimisées
- Gestes swipe et pinch-to-zoom

## 🔐 **Sécurité & Confidentialité**

- **Chiffrement** : Mots de passe hashés avec bcrypt
- **JWT** : Tokens d'authentification sécurisés
- **HTTPS** : Communication chiffrée (en production)
- **Privé** : Seulement vous deux avez accès
- **Données** : Stockées de manière sécurisée sur MongoDB Atlas

## 📱 **Installation sur iOS**

1. Ouvrir l'app dans Safari
2. Toucher le bouton "Partager" 📤
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer l'installation
5. L'icône US apparaît sur votre écran d'accueil ! ✨

## 📱 **Installation sur Android**

1. Ouvrir l'app dans Chrome
2. Toucher les 3 points ⋮ en haut à droite
3. Sélectionner "Ajouter à l'écran d'accueil"
4. Confirmer l'installation
5. L'app est maintenant installée ! ✨

## 🚀 **Prochaines fonctionnalités**

- [ ] Notifications push pour les rappels
- [ ] Mode sombre/clair
- [ ] Synchronisation en temps réel
- [ ] Partage de photos via l'appareil photo
- [ ] Export des données
- [ ] Thèmes personnalisés
- [ ] Géolocalisation pour les restaurants
- [ ] Planning/calendrier intégré

## 🤝 **Support**

Cette app a été créée spécialement pour vous deux ! 
Pour toute question ou amélioration, n'hésitez pas ! ❤️

---

