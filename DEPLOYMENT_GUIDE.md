# 🚀 Guide de Déploiement - US App

## Backend sur Heroku 🚁

### Prérequis
- Compte Heroku (gratuit)
- Heroku CLI installé
- MongoDB Atlas configuré

### Étapes de déploiement

1. **Installer Heroku CLI** (si pas déjà fait)
   ```bash
   # Windows (avec Chocolatey)
   choco install heroku-cli
   
   # Ou télécharger depuis https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Se connecter à Heroku**
   ```bash
   heroku login
   ```

3. **Créer l'application Heroku**
   ```bash
   cd backend
   heroku create us-app-backend-unique-name
   ```

4. **Configurer les variables d'environnement**
   ```bash
   heroku config:set MONGO_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET_KEY="your_super_secret_jwt_key"
   ```

5. **Déployer**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

6. **Vérifier le déploiement**
   ```bash
   heroku logs --tail
   heroku open
   ```

### URL de votre API
Votre API sera disponible à : `https://us-app-backend-unique-name.herokuapp.com`

---

## Frontend sur Vercel ⚡

### Prérequis
- Compte Vercel (gratuit)
- Vercel CLI (optionnel)

### Méthode 1 : Via GitHub (Recommandée)

1. **Aller sur Vercel.com**
   - Se connecter avec GitHub
   - Cliquer "New Project"
   - Importer `samba187/us-app`

2. **Configuration du projet**
   - Root Directory: `frontend`
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Variables d'environnement**
   - `REACT_APP_API_URL` = `https://us-app-backend-unique-name.herokuapp.com`

4. **Déployer**
   - Cliquer "Deploy"
   - Attendre 2-3 minutes

### Méthode 2 : Via CLI

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Se connecter**
   ```bash
   vercel login
   ```

3. **Déployer**
   ```bash
   cd frontend
   vercel --prod
   ```

### URL de votre app
Votre PWA sera disponible à : `https://us-app-frontend.vercel.app`

---

## Configuration finale 🔧

### 1. Mettre à jour le CORS (Backend)
Dans `app.py`, ajoutez votre domaine Vercel :
```python
CORS(app, origins=["https://us-app-frontend.vercel.app", "http://localhost:3000"])
```

### 2. Mettre à jour l'URL API (Frontend)
Dans `frontend/src/services/authService.js` :
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://us-app-backend-unique-name.herokuapp.com';
```

### 3. Re-déployer
```bash
# Backend
git add . && git commit -m "Update CORS for production"
git subtree push --prefix=backend heroku main

# Frontend se redéploie automatiquement via GitHub
```

---

## URLs finales 🌐

- **Frontend PWA** : https://us-app-frontend.vercel.app
- **Backend API** : https://us-app-backend-unique-name.herokuapp.com
- **Repository** : https://github.com/samba187/us-app

---

## Surveillance 📊

### Heroku
```bash
heroku logs --tail                # Logs en temps réel
heroku ps                        # Status des dynos
heroku config                    # Variables d'environnement
```

### Vercel
- Dashboard : https://vercel.com/dashboard
- Analytics automatiques
- Logs en temps réel

---

## Troubleshooting 🔧

### Erreurs communes

1. **Backend ne démarre pas**
   - Vérifier `MONGO_URI` dans Heroku config
   - Vérifier les logs : `heroku logs --tail`

2. **Frontend ne se connecte pas**
   - Vérifier `REACT_APP_API_URL` dans Vercel
   - Vérifier CORS dans app.py

3. **Base de données**
   - Vérifier la whitelist IP dans MongoDB Atlas (0.0.0.0/0 pour Heroku)

### Support
- Heroku Docs : https://devcenter.heroku.com/
- Vercel Docs : https://vercel.com/docs
