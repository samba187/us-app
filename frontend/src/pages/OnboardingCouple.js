import React, { useEffect, useState } from 'react';
import { coupleService } from '../services/authService';

export default function OnboardingCouple() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('code');
    if (c) setCode(c.toUpperCase());
  }, []);

  const join = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await coupleService.join(code.trim().toUpperCase());
      window.location.href = '/';
    } catch {
      setMsg('Code invalide');
    }
  };

  return (
    <div style={{maxWidth:520, margin:'40px auto'}}>
      <h2>Rejoindre mon/ma partenaire</h2>
      <form onSubmit={join}>
        <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Code d’invitation" />
        <button type="submit" style={{marginLeft:8}}>Rejoindre</button>
      </form>
      {msg && <p style={{color:'crimson'}}>{msg}</p>}
    </div>
  );
}
