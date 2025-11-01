import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import NotificationSettings from '../components/NotificationSettings';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:800px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;
const Row = styled.div` display:flex; align-items:center; justify-content:space-between; gap:10px; `;
const Select = styled.select` padding:10px; border:2px solid var(--border-color); border-radius:8px; `;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function Profile() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [couple, setCouple] = useState(null);

  useEffect(() => {
    const t = (localStorage.getItem('theme') || 'light');
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    (async () => {
      try { const r = await authService.api.get('/api/couple/me'); setCouple(r.data); }
      catch(e){}
    })();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
  };

  const onLangChange = (e) => {
    const v = e.target.value; setLang(v); localStorage.setItem('lang', v);
  };

  const logout = () => {
    authService.clearToken();
    window.location.reload();
  };

  return (
    <Container>
      <Title>Profil</Title>
      <Card>
        <div style={{fontWeight:600, marginBottom:8}}>Couple</div>
        {couple?.in_couple ? (
          <div>
            <div>Code d’invitation: <code>{couple.invite_code || '—'}</code></div>
            <div style={{marginTop:6}}>Membres:</div>
            <ul style={{margin:0}}>
              {(couple.members||[]).map(m => <li key={m.id}>{m.name} — {m.email}</li>)}
            </ul>
          </div>
        ) : (
          <div>Vous n’êtes pas encore lié(e) — allez dans « Couple » pour créer/rejoindre.</div>
        )}
      </Card>
      <Card>
        <Row>
          <div>
            <div style={{fontWeight:600}}>Langue</div>
            <div style={{opacity:.8, fontSize:13}}>Choisissez votre langue d’interface</div>
          </div>
          <Select value={lang} onChange={onLangChange}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        </Row>
      </Card>

      <Card>
        <Row>
          <div>
            <div style={{fontWeight:600}}>Apparence</div>
            <div style={{opacity:.8, fontSize:13}}>Mode {theme === 'dark' ? 'sombre' : 'clair'}</div>
          </div>
          <Button onClick={toggleTheme}>Basculer</Button>
        </Row>
      </Card>

      <NotificationSettings />

      <Card>
        <Row>
          <div>
            <div style={{fontWeight:600}}>Déconnexion</div>
            <div style={{opacity:.8, fontSize:13}}>Se déconnecter de ce dispositif</div>
          </div>
          <Button onClick={logout}>Se déconnecter</Button>
        </Row>
      </Card>
    </Container>
  );
}
