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
import OnboardingCouple from './pages/OnboardingCouple';
import Profile from './pages/Profile';
import { authService } from './services/authService';

function useHashRouter() {
  const [path, setPath] = useState(() => window.location.hash.replace('#','') || '/');
  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.replace('#','') || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const navigate = (to) => { if (!to.startsWith('#')) window.location.hash = '#' + to; else window.location.hash = to; };
  return { path, navigate };
}

function AppShell({ children, path, navigate }) {
  const title = useMemo(() => {
    if (path === '/') return 'Accueil';
    if (path.startsWith('/wishlist')) return 'Wishlist';
    if (path.startsWith('/reminders')) return 'Rappels';
    if (path.startsWith('/photos')) return 'Photos';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/onboarding')) return 'Couple';
    return 'US';
  }, [path]);
  return (
    <div>
      <header style={{position:'sticky', top:0, zIndex:101, background:'var(--card-bg)', borderBottom:'1px solid var(--border-color)'}}>
        <div style={{maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 15px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <img src="/logo.svg" alt="US" width="28" height="28" />
            <div style={{fontWeight:700, color:'var(--text-color)'}}>{title}</div>
          </div>
          <button onClick={()=>navigate('/profile')} style={{width:34, height:34, borderRadius:20, border:'1px solid var(--border-color)', background:'#fff', cursor:'pointer'}} title="Profil">
            🙂
          </button>
        </div>
      </header>
      <main className="fade-in" style={{paddingBottom:64}}>{children}</main>
      <Navigation current={path} onNavigate={navigate} />
    </div>
  );
}

function Router({ path, navigate }) {
  if (path === '/') return <Home navigate={navigate} />;
  if (path.startsWith('/wishlist')) return <Wishlist />;
  if (path.startsWith('/reminders')) return <Reminders />;
  if (path.startsWith('/photos')) return <Photos />;
  if (path.startsWith('/notes')) return <Notes />;
  if (path.startsWith('/onboarding')) return <OnboardingCouple />;
  if (path.startsWith('/profile')) return <Profile />;
  return <Home navigate={navigate} />;
}

function App() {
  const { path, navigate } = useHashRouter();
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));
  useEffect(() => { authService.init(); }, []);
  if (!authed) return <Login onLogin={()=>setAuthed(true)} />;
  return (
    <ErrorBoundary>
      <AppShell path={path} navigate={navigate}>
        <Router path={path} navigate={navigate} />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
