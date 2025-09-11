import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';

// Components
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import PWAGuide from './components/PWAGuide';
import NotificationTester from './components/NotificationTester';
import PWADiagnostic from './components/PWADiagnostic';
import Home from './pages/Home';
import Reminders from './pages/Reminders';
import Restaurants from './pages/Restaurants';
import Activities from './pages/Activities';
import Wishlist from './pages/Wishlist';
import Photos from './pages/Photos';
import Notes from './pages/Notes';
import OnboardingCouple from './pages/OnboardingCouple';
import Profile from './pages/Profile';

// Services
// import { authService } from './services/authService';
import crossNotificationService from './services/crossNotificationService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.$isAuthenticated ? 'var(--background-color)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`;

const MainContent = styled.main`
  padding-bottom: 80px; /* Space for navigation */
  min-height: 100vh;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 App useEffect - Vérification authentification...');
    const token = localStorage.getItem('us_token');
    const userData = localStorage.getItem('us_user');
    
    console.log('Token présent:', !!token);
    console.log('User data présent:', !!userData);
    
    if (token) {
      // Vérifier si le token est valide
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isValid = payload.exp * 1000 > Date.now();
        
        console.log('Token valide:', isValid);
        console.log('Token expiration:', new Date(payload.exp * 1000));
        
        if (isValid && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
          console.log('✅ Utilisateur authentifié');
        } else {
          console.log('❌ Token expiré ou données manquantes');
          localStorage.removeItem('us_token');
          localStorage.removeItem('us_user');
        }
      } catch (error) {
        console.error('❌ Erreur parsing token:', error);
        localStorage.removeItem('us_token');
        localStorage.removeItem('us_user');
      }
    } else {
      console.log('❌ Aucun token trouvé');
    }
    
    setLoading(false);
    console.log('🏁 App initialization complete');
  }, []);

  // Démarrer les notifications croisées quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      crossNotificationService.startCrossNotifications();
      
      // Arrêter les notifications lors de la déconnexion
      return () => {
        crossNotificationService.stopCrossNotifications();
      };
    }
  }, [isAuthenticated, user]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('us_token', token);
    localStorage.setItem('us_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('us_token');
    localStorage.removeItem('us_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          Chargement... ❤️
        </div>
      </AppContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AppContainer $isAuthenticated={isAuthenticated}>
          <Login onLogin={handleLogin} />
          <PWADiagnostic />
        </AppContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppContainer $isAuthenticated={isAuthenticated}>
        <Router>
          <MainContent>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/onboarding-couple" element={<OnboardingCouple />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MainContent>
          {/* Ne pas afficher la navigation sur la page onboarding */}
          {window.location.pathname !== '/onboarding-couple' && <Navigation />}
          <PWAGuide />
          <NotificationTester />
          <PWADiagnostic />
        </Router>
      </AppContainer>
    </ErrorBoundary>
  );
}export default App;
