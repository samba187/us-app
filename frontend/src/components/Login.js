import React, { useState } from 'react';
import { authService, coupleService } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { access_token, user } = await authService.login(email, password);
      localStorage.setItem('us_token', access_token);
      localStorage.setItem('us_user', JSON.stringify(user));

      // Vérifie état couple
      const cm = await coupleService.me();
      if (!cm.in_couple) {
        window.location.href = '/onboarding-couple';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        <button type="submit">Se connecter</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
