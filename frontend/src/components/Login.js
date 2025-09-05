import React, { useState } from 'react';
import { authService, coupleService } from '../api'; // adapte le chemin si besoin

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

      const cm = await coupleService.me();       // ✅ vérifie l’état couple
      if (!cm.in_couple) {
        window.location.href = '/onboarding-couple';
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Identifiants invalides');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mot de passe" />
      <button type="submit">Se connecter</button>
      {error && <p style={{color:'crimson'}}>{error}</p>}
    </form>
  );
}
