import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { authService } from '../services/authService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
`;

const Wrap = styled.div`
  max-width: 440px;
  margin: 80px auto;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.3);
  padding: 32px 28px;
  animation: ${fadeIn} 0.5s ease-out;

  @supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
    backdrop-filter: saturate(180%) blur(16px);
    -webkit-backdrop-filter: saturate(180%) blur(16px);
  }

  @media (max-width: 768px) {
    margin: 40px 16px;
    padding: 24px 20px;
  }
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
`;

const Subtitle = styled.p`
  color: var(--muted-text);
  font-size: 14px;
  text-align: center;
  margin: 0 0 24px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Switch = styled.button`
  margin-top: 16px;
  background: none;
  border: none;
  color: var(--neon-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
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
      <Subtitle>
        {mode === 'login' ? 'Bienvenue sur US' : 'Rejoignez US'}
      </Subtitle>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <Input
            placeholder="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={busy}>
          {busy ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
        </Button>
      </form>
      <div style={{ textAlign: 'center' }}>
        <Switch onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Créer un compte" : 'Déjà inscrit ? Se connecter'}
        </Switch>
      </div>
    </Wrap>
  );
}
