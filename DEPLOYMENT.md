# 🚀 Guide de Déploiement - US App

## 📋 Prérequis

1. **MongoDB Atlas** - Base de données cloud
2. **Heroku** ou **Vercel** - Hébergement
3. **Git** - Contrôle de version

## 🗄️ Configuration MongoDB Atlas

### 1. Créer le cluster
```bash
1. Aller sur https://cloud.mongodb.com/
2. Créer un compte gratuit
3. Créer un nouveau cluster (M0 Sandbox - GRATUIT)
4. Choisir votre région (Europe West - Ireland)
5. Nommer le cluster : "us-app-cluster"
```

### 2. Configurer la sécurité
```bash
1. Database Access → Add New Database User
   - Username: dbadmin
   - Password: [générer un mot de passe fort]
   - Roles: Atlas admin

2. Network Access → Add IP Address
   - Ajouter "0.0.0.0/0" (accès depuis partout)
   - Ou ajouter votre IP spécifique
```

### 3. Récupérer la chaîne de connexion
```bash
1. Clusters → Connect → Connect your application
2. Driver: Python, Version: 3.6 or later
3. Copier l'URL de connexion :
   mongodb+srv://dbadmin:<password>@us-app-cluster.xxxxx.mongodb.net/us_app
4. Remplacer <password> par votre vrai mot de passe
```

## 🚀 Déploiement Backend (Heroku)

### 1. Préparer le backend
```bash
cd backend

# Créer Procfile
echo "web: gunicorn app:app" > Procfile

# Créer runtime.txt
echo "python-3.9.16" > runtime.txt
```

### 2. Déployer sur Heroku
```bash
# Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Créer l'app
heroku create us-app-backend

# Ajouter les variables d'environnement
heroku config:set MONGO_URI="mongodb+srv://dbadmin:VOTRE_PASSWORD@us-app-cluster.xxxxx.mongodb.net/us_app"
heroku config:set JWT_SECRET_KEY="votre-cle-jwt-super-secrete"
heroku config:set FLASK_ENV="production"

# Déployer
git add .
git commit -m "Initial backend deployment"
git push heroku main
```

## 🌐 Déploiement Frontend (Vercel)

### 1. Préparer le frontend
```bash
cd frontend

# Configurer l'API URL pour la production
# Créer .env.production
echo "REACT_APP_API_URL=https://us-app-backend.herokuapp.com/api" > .env.production
```

### 2. Déployer sur Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer
vercel

# Configurer :
# ? Set up and deploy? → Yes
# ? Which scope? → Votre compte
# ? Link to existing project? → No
# ? What's your project's name? → us-app
# ? In which directory is your code located? → ./
# ? Want to override the settings? → No

# Déployer en production
vercel --prod
```

## 📱 Configuration PWA Production

### 1. HTTPS obligatoire
- Vercel fournit automatiquement HTTPS
- Les PWA nécessitent HTTPS pour fonctionner

### 2. Manifest et Service Worker
- Déjà configurés dans le code
- Vérifier que les icônes sont présentes

### 3. Test d'installation
```bash
1. Ouvrir l'app sur mobile (Safari iOS / Chrome Android)
2. Vérifier que la bannière d'installation apparaît
3. Tester l'installation sur l'écran d'accueil
4. Vérifier le fonctionnement hors ligne
```

## 🔧 Variables d'Environnement

### Backend (.env)
```bash
MONGO_URI=mongodb+srv://dbadmin:PASSWORD@cluster.mongodb.net/us_app
JWT_SECRET_KEY=votre-cle-jwt-super-secrete-64-caracteres-minimum
FLASK_ENV=production
SECRET_KEY=votre-cle-secrete-flask
```

### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://votre-backend.herokuapp.com/api
```

## 🧪 Tests après déploiement

### 1. Test API Backend
```bash
# Tester l'API
curl https://us-app-backend.herokuapp.com/api/health

# Devrait retourner : {"status": "OK", "message": "US API is running"}
```

### 2. Test Frontend
```bash
# Ouvrir dans le navigateur
https://us-app.vercel.app

# Vérifier :
- ✅ Page de connexion s'affiche
- ✅ Création de compte fonctionne
- ✅ Connexion fonctionne
- ✅ Navigation entre les pages
- ✅ Ajout de données (rappels, restos, etc.)
```

### 3. Test PWA
```bash
# Sur mobile :
- ✅ Bannière d'installation apparaît
- ✅ Installation sur écran d'accueil réussie
- ✅ Ouverture en mode app (sans barre navigateur)
- ✅ Fonctionnement hors ligne basique
```

## 🔒 Sécurité Production

### 1. Environnement
```bash
# S'assurer que DEBUG=False en production
# Changer toutes les clés secrètes
# Utiliser des mots de passe forts
```

### 2. MongoDB
```bash
# Restreindre l'accès IP si possible
# Utiliser un utilisateur avec privilèges minimaux
# Activer l'audit logging
```

### 3. HTTPS
```bash
# Forcer HTTPS (automatique avec Vercel/Heroku)
# Configurer les headers de sécurité
```

## 📊 Monitoring

### 1. Logs Backend (Heroku)
```bash
heroku logs --tail -a us-app-backend
```

### 2. Analytics Frontend (Vercel)
```bash
# Dashboard Vercel pour les analytics
# Google Analytics (optionnel)
```

### 3. MongoDB Monitoring
```bash
# Atlas Dashboard pour les métriques
# Alertes sur l'utilisation
```

## 🔄 Mise à jour

### Backend
```bash
git add .
git commit -m "Update backend"
git push heroku main
```

### Frontend
```bash
git add .
git commit -m "Update frontend"
vercel --prod
```

## 🆘 Dépannage

### Erreurs communes :

1. **CORS Error**
   - Vérifier FLASK_CORS configuration
   - Ajouter l'URL frontend dans les origins

2. **MongoDB Connection Failed**
   - Vérifier la chaîne de connexion
   - Confirmer les droits utilisateur
   - Vérifier l'IP whitelist

3. **PWA ne s'installe pas**
   - Vérifier HTTPS
   - Contrôler le manifest.json
   - Tester le Service Worker

4. **API 500 Error**
   - Consulter les logs Heroku
   - Vérifier les variables d'environnement

---

*Une fois déployé, vous aurez votre app US accessible partout ! 🎉*
