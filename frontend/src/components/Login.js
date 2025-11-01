import React, { useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Wrap = styled.div`
  max-width: 420px; margin: 60px auto; background:#fff; border:1px solid var(--border-color); border-radius:16px; box-shadow:var(--shadow); padding:20px;
`;
const Title = styled.h2` margin:0 0 12px 0; `;
const Input = styled.input` width:100%; padding:12px; border:2px solid var(--border-color); border-radius:8px; margin-bottom:10px; `;
const Button = styled.button` width:100%; padding:12px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;
const Switch = styled.button` margin-top:8px; background:none; border:none; color:var(--primary-color); cursor:pointer; `;

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === 'login') await authService.login(email, password);
      else await authService.register(name, email, password);
      onLogin && onLogin();
    } catch (e) {
      alert((e?.response?.data?.error) || e.message);
    }
    setBusy(false);
  };

  return (
    <Wrap>
      <Title>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</Title>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <Input placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} required />
        )}
        <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <Input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} required />
        <Button type="submit" disabled={busy}>{busy ? '...' : (mode==='login' ? 'Se connecter' : "S'inscrire")}</Button>
      </form>
      <div style={{textAlign:'center'}}>
        <Switch onClick={()=>setMode(mode==='login'?'register':'login')}>
          {mode==='login' ? "Créer un compte" : 'Déjà inscrit ? Se connecter'}
        </Switch>
      </div>
    </Wrap>
  );
}


