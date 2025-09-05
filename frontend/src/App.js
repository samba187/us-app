import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// Components
import Login from './components/Login';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Reminders from './pages/Reminders';
import Restaurants from './pages/Restaurants';
import Activities from './pages/Activities';
import Wishlist from './pages/Wishlist';
import Photos from './pages/Photos';
import Notes from './pages/Notes';
import OnboardingCouple from './pages/OnboardingCouple';

// Services
// import { authService } from './services/authService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.isAuthenticated ? 'var(--background-color)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
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
    const token = localStorage.getItem('us_token');
    if (token) {
      // Vérifier si le token est valide
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(JSON.parse(localStorage.getItem('us_user')));
        } else {
          localStorage.removeItem('us_token');
          localStorage.removeItem('us_user');
        }
      } catch (error) {
        localStorage.removeItem('us_token');
        localStorage.removeItem('us_user');
      }
    }
    setLoading(false);
  }, []);

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
      <AppContainer isAuthenticated={isAuthenticated}>
        <Login onLogin={handleLogin} />
      </AppContainer>
    );
  }

  return (
    <AppContainer isAuthenticated={isAuthenticated}>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainContent>
        {/* Ne pas afficher la navigation sur la page onboarding */}
        {window.location.pathname !== '/onboarding-couple' && <Navigation onLogout={handleLogout} />}
      </Router>
    </AppContainer>
  );
}

export default App;
