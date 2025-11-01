import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:700px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;
const Input = styled.input` width:100%; padding:12px; border:2px solid var(--border-color); border-radius:8px; `;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function OnboardingCouple() {
  const [me, setMe] = useState(null);
  const [code, setCode] = useState('');

  const load = async () => {
    try { const r = await authService.api.get('/api/couple/me'); setMe(r.data); }
    catch(e){ console.error(e); }
  };

  useEffect(()=>{ load(); }, []);

  const create = async () => {
    try { await authService.api.post('/api/couple/create'); await load(); }
    catch(e){ alert(e?.response?.data?.error || e.message); }
  };
  const join = async () => {
    try { await authService.api.post('/api/couple/join', { invite_code: code }); await load(); }
    catch(e){ alert(e?.response?.data?.error || e.message); }
  };

  return (
    <Container>
      <Title>Connexion de couple</Title>
      {me?.in_couple ? (
        <Card>
          <div style={{fontWeight:600, marginBottom:6}}>Vous êtes en couple ♥</div>
          <div>Code d’invitation: <code>{me.invite_code || '—'}</code></div>
          <div style={{opacity:.8, fontSize:13}}>Partagez ce code pour relier le compte de votre partenaire.</div>
          <div style={{marginTop:8}}>
            <div>Membres:</div>
            <ul>
              {(me.members||[]).map(m => <li key={m.id}>{m.name} — {m.email}</li>)}
            </ul>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div style={{fontWeight:600, marginBottom:6}}>Créer un couple</div>
            <Button onClick={create}>Créer</Button>
          </Card>
          <Card>
            <div style={{fontWeight:600, marginBottom:6}}>Rejoindre avec un code</div>
            <Input placeholder="Code (ex: ABC123)" value={code} onChange={e=>setCode(e.target.value)} />
            <div style={{height:8}} />
            <Button onClick={join}>Rejoindre</Button>
          </Card>
        </>
      )}
    </Container>
  );
}


