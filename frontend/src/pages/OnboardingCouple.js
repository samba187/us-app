import React, { useState, useEffect } from 'react';
import { coupleService } from '../api';

export default function OnboardingCouple() {
  const [invite, setInvite] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coupleService.me().then((cm) => {
      if (cm.in_couple) window.location.href = '/';
      setLoading(false);
    });
  }, []);

  const createSpace = async () => {
    setErr('');
    try {
      const res = await coupleService.create();
      alert(`Code d’invitation : ${res.invite_code}`);
      window.location.href = '/';
    } catch (e) {
      setErr(e.response?.data?.error || 'Erreur');
    }
  };

  const joinSpace = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await coupleService.join(invite.trim().toUpperCase());
      window.location.href = '/';
    } catch (e) {
      setErr(e.response?.data?.error || 'Code invalide');
    }
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>Relier votre espace</h2>
      <button onClick={createSpace}>Créer notre espace</button>
      <form onSubmit={joinSpace}>
        <input
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="Code d’invitation"
        />
        <button type="submit">Rejoindre</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </div>
  );
}
