import React, { useState } from 'react';
import styled from 'styled-components';
import { authService, coupleService } from '../services/authService';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  margin-bottom: 30px;
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authService.login(formData.email, formData.password);
      } else {
        response = await authService.register(formData.name, formData.email, formData.password);
      }
      
      // Marquer l'utilisateur comme connecté AVANT de vérifier le couple
      onLogin(response.token, response.user);
      
      // Vérifier le statut couple après un petit délai pour laisser le state se mettre à jour
      setTimeout(async () => {
        try {
          const coupleStatus = await coupleService.me();
          if (coupleStatus.status === 'single') {
            // Rediriger vers onboarding couple
            window.location.href = '/onboarding-couple';
            return;
          }
        } catch (coupleError) {
          // Si erreur 409, l'intercepteur redirigera automatiquement
          if (coupleError.response?.status === 409) {
            return;
          }
        }
      }, 100);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    }
    
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard className="fade-in">
        <Logo>US</Logo>
        <Subtitle>Notre app privée ❤️</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              type="text"
              name="name"
              placeholder="Votre prénom"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </Button>
        </Form>
        
        <ToggleButton onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
        </ToggleButton>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;
