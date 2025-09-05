# Script de déploiement PowerShell pour US App
Write-Host "🚀 Déploiement de US App" -ForegroundColor Green

# 1. Commiter les changements locaux
Write-Host "📝 Commit des changements..." -ForegroundColor Yellow
git add .
git commit -m "Production deployment updates"
git push origin main

# 2. Instructions pour Heroku
Write-Host "🚁 Pour déployer le backend sur Heroku:" -ForegroundColor Cyan
Write-Host "1. heroku login" -ForegroundColor White
Write-Host "2. heroku create us-app-backend-unique-name" -ForegroundColor White
Write-Host "3. heroku config:set MONGO_URI='your_mongodb_connection'" -ForegroundColor White
Write-Host "4. heroku config:set JWT_SECRET_KEY='your_secret_key'" -ForegroundColor White
Write-Host "5. git subtree push --prefix=backend heroku main" -ForegroundColor White

# 3. Instructions pour Vercel
Write-Host "⚡ Pour déployer le frontend sur Vercel:" -ForegroundColor Cyan
Write-Host "1. Aller sur vercel.com" -ForegroundColor White
Write-Host "2. Connecter avec GitHub" -ForegroundColor White
Write-Host "3. Importer le repo samba187/us-app" -ForegroundColor White
Write-Host "4. Root Directory: frontend" -ForegroundColor White
Write-Host "5. Ajouter REACT_APP_API_URL=https://your-heroku-app.herokuapp.com" -ForegroundColor White

Write-Host "✅ Configuration prête pour le déploiement!" -ForegroundColor Green
