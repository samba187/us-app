import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Wishlist from './pages/Wishlist';
import Home from './pages/Home';
import Reminders from './pages/Reminders';
import Notes from './pages/Notes';
import Photos from './pages/Photos';
import Restaurants from './pages/Restaurants';
import Memories from './pages/Memories';
import OnboardingCouple from './pages/OnboardingCouple';
import Profile from './pages/Profile';
import { authService } from './services/authService';

function useHashRouter() {
  const [path, setPath] = useState(() => window.location.hash.replace('#', '') || '/');
  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const navigate = (to) => { if (!to.startsWith('#')) window.location.hash = '#' + to; else window.location.hash = to; };
  return { path, navigate };
}

function AppShell({ children, path, navigate, me }) {
  const title = useMemo(() => {
    if (path === '/') return 'Accueil';
    if (path.startsWith('/wishlist')) return 'Wishlist';
    if (path.startsWith('/reminders')) return 'Rappels';
    if (path.startsWith('/photos')) return 'Photos';
    if (path.startsWith('/memories')) return 'Souvenirs';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/onboarding')) return 'Couple';
    return 'US';
  }, [path]);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const avatarSrc = me?.avatar_url ? (me.avatar_url.startsWith('http') ? me.avatar_url : `${API_BASE}${me.avatar_url.startsWith('/') ? '' : '/'}${me.avatar_url}`) : null;
  return (
    <div>
      <header style={{ position: 'sticky', top: 0, zIndex: 101, borderBottom: '1px solid var(--border-color)' }}>
        <div className="glass" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="US" width="28" height="28" style={{ filter: 'drop-shadow(0 0 10px rgba(124,58,237,.35))' }} />
            <div style={{ fontWeight: 700, letterSpacing: .3, color: 'var(--text-color)' }}>{title}</div>
          </div>
          <button onClick={() => navigate('/profile')} style={{ width: 38, height: 38, borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', cursor: 'pointer', overflow: 'hidden' }} title="Profil">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '🙂'}
          </button>
        </div>
      </header>
      <main className="fade-slide" style={{ paddingBottom: 72 }}>{children}</main>
      <Navigation current={path} onNavigate={navigate} />
    </div>
  );
}

function Router({ path, navigate, needsOnboarding }) {
  // Forcer onboarding si pas de couple (sauf si déjà sur /onboarding ou /profile)
  if (needsOnboarding && !['/onboarding', '/profile'].some(p => path.startsWith(p))) {
    return <OnboardingCouple navigate={navigate} />;
  }
  if (path === '/') return <Home navigate={navigate} />;
  if (path.startsWith('/wishlist')) return <Wishlist />;
  if (path.startsWith('/reminders')) return <Reminders />;
  if (path.startsWith('/photos')) return <Photos />;
  if (path.startsWith('/memories')) return <Memories />;
  if (path.startsWith('/restaurants')) return <Restaurants />;
  if (path.startsWith('/notes')) return <Notes />;
  if (path.startsWith('/onboarding')) return <OnboardingCouple navigate={navigate} />;
  if (path.startsWith('/profile')) return <Profile />;
  return <Home navigate={navigate} />;
}

function App() {
  const { path, navigate } = useHashRouter();
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));
  const [coupleStatus, setCoupleStatus] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => { authService.init(); }, []);
  useEffect(() => {
    const t = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (authed) {
      authService.api.get('/api/couple/me').then(r => {
        setCoupleStatus(r.data?.in_couple ? 'ok' : 'needs_onboarding');
      }).catch(() => setCoupleStatus('needs_onboarding'));
      authService.api.get('/api/me').then(r => setMe(r.data)).catch(() => { });
    }
  }, [authed]);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const needsOnboarding = coupleStatus === 'needs_onboarding';

  return (
    <ErrorBoundary>
      <AppShell path={path} navigate={navigate} me={me}>
        <Router path={path} navigate={navigate} needsOnboarding={needsOnboarding} />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
