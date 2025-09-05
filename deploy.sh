#!/bin/bash
# Script de déploiement automatique pour US App

echo "🚀 Déploiement de US App"

# 1. Commiter les changements locaux
echo "📝 Commit des changements..."
git add .
git commit -m "Production deployment updates"
git push origin main

# 2. Déployer le backend sur Heroku
echo "🚁 Déploiement backend sur Heroku..."
cd backend
git init
git add .
git commit -m "Backend deployment"
heroku git:remote -a us-app-backend-unique-name
git push heroku main
cd ..

# 3. Le frontend se déploie automatiquement sur Vercel via GitHub

echo "✅ Déploiement terminé!"
echo "🌐 Frontend: https://us-app-frontend.vercel.app"
echo "🔧 Backend: https://us-app-backend-unique-name.herokuapp.com"
