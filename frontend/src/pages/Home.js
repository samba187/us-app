import React, { useEffect, useState } from 'react';
import { coupleService } from '../api';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [inCouple, setInCouple] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const cm = await coupleService.me();
        setInCouple(!!cm.in_couple);
        setInviteCode(cm.invite_code || null);
        if (cm.members && cm.members.length > 1) {
          const me = JSON.parse(localStorage.getItem('us_user') || '{}');
          setPartner(cm.members.find(m => m.email !== me?.email) || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInvite = async () => {
    try {
      let code = inviteCode;
      if (!code) {
        const cm = await coupleService.me();
        code = cm.invite_code;
        if (!code) {
          const res = await coupleService.create(); // crée/refait le code si besoin
          code = res.invite_code;
        }
      }
      setInviteCode(code);
      const shareUrl = `${window.location.origin}/onboarding-couple?code=${code}`;
      alert(`Code d’invitation : ${code}\n\nLien à envoyer :\n${shareUrl}`);
      if (navigator.share) {
        try { await navigator.share({ title: 'Notre app', text: `Code : ${code}`, url: shareUrl }); } catch {}
      }
    } catch {
      alert('Impossible de générer le code. Réessaie.');
    }
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div>
      {!inCouple ? (
        <div style={{margin:'16px 0', padding:16, border:'1px solid #eee', borderRadius:12}}>
          <div style={{fontWeight:700, marginBottom:8}}>En attente… 💕</div>
          <div>Invite ta copine à rejoindre l’app !</div>
          <button onClick={handleInvite} style={{marginTop:12}}>Générer / afficher le code</button>
          {inviteCode && <div style={{marginTop:8, fontFamily:'monospace'}}>Code : <strong>{inviteCode}</strong></div>}
        </div>
      ) : (
        <div style={{margin:'16px 0', padding:16, border:'1px solid #eee', borderRadius:12}}>
          <div>💑 Vous êtes reliés {partner ? `avec ${partner.name}` : ''} — profitez de l’app !</div>
        </div>
      )}

      {/* … le reste de ta Home (cartes, etc.) */}
    </div>
  );
}
