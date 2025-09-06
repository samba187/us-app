import React, { useState } from 'react';
import styled from 'styled-components';
import { authService, coupleService } from '../services/authService';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  animation: fadeIn .4s ease;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 42px;
  background: linear-gradient(135deg,#ff6b8a,#4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 32px;
  text-align: center;
  color: #555;
  font-size: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Input = styled.input`
  padding: 14px 16px;
  font-size: 15px;
  border: 2px solid #e3e6ec;
  border-radius: 14px;
  outline: none;
  transition: border-color .25s, box-shadow .25s;
  background: #fff;
  &:focus {
    border-color: #ff6b8a;
    box-shadow: 0 0 0 3px rgba(255,107,138,0.25);
  }
`;

const Button = styled.button`
  padding: 14px 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg,#ff6b8a,#4ecdc4);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .25s, box-shadow .25s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: .6; cursor: not-allowed; transform: none; }
`;

const ErrorMsg = styled.div`
  background: rgba(220,53,69,0.12);
  color: #c62828;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
`;

const Toggle = styled.button`
  margin-top: 22px;
  width: 100%;
  background: none;
  border: none;
  color: #ff6b8a;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
`;

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      let authData;
      if (mode === 'login') {
        authData = await authService.login(email.trim(), password);
      } else {
        if (name.trim().length < 2) throw new Error('Nom trop court');
        authData = await authService.register(name.trim(), email.trim(), password);
      }
      const { access_token, user } = authData;
      localStorage.setItem('us_token', access_token);
      localStorage.setItem('us_user', JSON.stringify(user));
      try {
        const cm = await coupleService.me();
        if (!cm.in_couple) window.location.href = '/onboarding-couple';
        else window.location.href = '/';
      } catch { window.location.href = '/onboarding-couple'; }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur');
    }
    setLoading(false);
  };

  return (
    <Container>
      <Card>
        <Title>US</Title>
        <Subtitle>{mode === 'login' ? 'Connexion à notre espace 💞' : 'Créer ton compte 💖'}</Subtitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom"
              required
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? (mode==='login'?'Connexion…':'Création…') : (mode==='login'?'Se connecter':'Créer le compte')}
          </Button>
        </Form>
        <Toggle
          type="button"
          onClick={()=>{ setMode(mode==='login'?'register':'login'); setError(''); }}
        >
          {mode==='login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </Toggle>
      </Card>
    </Container>
  );
}
