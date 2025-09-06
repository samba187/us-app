import React, { useEffect, useState } from 'react';
import { coupleService, reminderService } from '../services/authService';

// Mini styles (inline / simple) to avoid heavy duplication from Reminders page
const sectionStyle = {margin:'24px 0', padding:16, border:'1px solid #eee', borderRadius:12, background:'#fff'};
const reminderItemStyle = priority => ({
  padding:'10px 12px',
  borderRadius:12,
  background:'#fff',
  boxShadow:'0 2px 6px rgba(0,0,0,0.06)',
  display:'flex',
  flexDirection:'column',
  gap:4,
  borderLeft:`4px solid ${priority==='urgent' ? '#ff4757' : priority==='important' ? '#ffa502' : '#2ed573'}`
});
const badgeStyle = priority => ({
  fontSize:11, fontWeight:600, alignSelf:'flex-start', padding:'2px 8px', borderRadius:20,
  background: priority==='urgent' ? 'rgba(255,71,87,.12)' : priority==='important' ? 'rgba(255,165,2,.15)' : 'rgba(46,213,115,.15)',
  color: priority==='urgent' ? '#ff4757' : priority==='important' ? '#c07900' : '#038a46'
});

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [inCouple, setInCouple] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [partner, setPartner] = useState(null);
  const [reminders, setReminders] = useState([]); // preview
  const [remindersLoading, setRemindersLoading] = useState(false);

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
        if (cm.in_couple) {
          // Charger un aperçu de 3 rappels (priorité urgente ou en cours) triés par due date puis priorité
          setRemindersLoading(true);
          try {
            const data = await reminderService.getAll();
            const sorted = [...data].sort((a,b)=>{
              // Priorité: urgent > important > normal
              const pr = p=> p==='urgent'?0 : p==='important'?1:2;
              const dueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
              const dueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
              if (dueA !== dueB) return dueA - dueB;
              return pr(a.priority) - pr(b.priority);
            }).filter(r=> r.status!=='done').slice(0,3);
            setReminders(sorted);
          } catch {}
          setRemindersLoading(false);
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

      {inCouple && (
        <div style={sectionStyle}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h2 style={{margin:0,fontSize:20}}>Rappels rapides</h2>
            <a href="/reminders" style={{fontSize:13,fontWeight:600,color:'#ff6b8a'}}>Tous ➜</a>
          </div>
          {remindersLoading && <div style={{fontSize:14,color:'#666'}}>Chargement…</div>}
          {!remindersLoading && reminders.length===0 && (
            <div style={{fontSize:14,color:'#777'}}>Aucun rappel en cours. <a href="/reminders" style={{color:'#ff6b8a'}}>Créer un rappel</a>.</div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {reminders.map(r=> (
              <div key={r._id} style={reminderItemStyle(r.priority)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{fontWeight:600,fontSize:15}}>{r.title}</div>
                  <span style={badgeStyle(r.priority)}>{r.priority}</span>
                </div>
                {r.description && <div style={{fontSize:13,color:'#555'}}>{r.description.slice(0,120)}{r.description.length>120?'…':''}</div>}
                <div style={{fontSize:11,color:'#666',display:'flex',gap:12}}>
                  {r.due_date && <span>📅 {new Date(r.due_date).toLocaleDateString('fr-FR')}</span>}
                  {r.status==='pending' && <span>⏳ en cours</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/** … le reste de ta Home (cartes, etc.) */}
    </div>
  );
}
