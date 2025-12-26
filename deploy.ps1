# Build and Deploy Script
Write-Host "Starting Deployment Process..."

# Backend Setup
Write-Host "Setting up Backend..."
python -m pip install -r requirements.txt

# Frontend Setup
Write-Host "Setting up Frontend..."
cd frontend
npm install
npm run build
cd ..

Write-Host "Deployment Ready. Use 'flask run' or deploy to cloud provider."
