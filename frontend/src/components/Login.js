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
`;

const ErrorMsg = styled.div`
  background: rgba(220,53,69,0.12);
  color: #c62828;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { access_token, user } = await authService.login(email.trim(), password);
      localStorage.setItem('us_token', access_token);
      localStorage.setItem('us_user', JSON.stringify(user));

      try {
        const cm = await coupleService.me();
        if (!cm.in_couple) {
          window.location.href = '/onboarding-couple';
        } else {
          window.location.href = '/';
        }
      } catch {
        window.location.href = '/onboarding-couple';
      }
    } catch {
      setError('Identifiants invalides');
    }
    setLoading(false);
  };

  return (
    <Container>
      <Card>
        <Title>US</Title>
        <Subtitle>Connexion à notre espace 💞</Subtitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Form onSubmit={handleLogin}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <Button type="submit" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</Button>
        </Form>
      </Card>
    </Container>
  );
}
