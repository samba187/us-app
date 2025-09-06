import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { coupleService } from '../services/authService';

const Wrapper = styled.div`max-width:860px;margin:40px auto;padding:24px;display:grid;gap:32px;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));`;
const Panel = styled.div`background:#fff;border-radius:28px;padding:32px 28px;box-shadow:0 12px 32px -8px rgba(0,0,0,0.12);position:relative;overflow:hidden;`;
const Title = styled.h2`margin:0 0 6px;font-size:26px;font-weight:700;background:linear-gradient(135deg,#ff6b8a,#4ecdc4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;`;
const Sub = styled.p`margin:0 0 20px;color:#555;font-size:14px;line-height:1.5;`;
const CodeBox = styled.div`font-size:40px;font-weight:700;letter-spacing:6px;font-family:'Courier New',monospace;background:#f3f5f7;border:3px dashed #d6dce2;padding:22px 10px;text-align:center;border-radius:22px;user-select:all;`;
const ButtonsRow = styled.div`display:flex;flex-wrap:wrap;gap:12px;margin-top:22px;`;
const Btn = styled.button`flex:1;padding:14px 16px;border:none;border-radius:16px;font-weight:600;font-size:15px;cursor:pointer;background:${p=>p.variant==='secondary'?'#eef1f5':'linear-gradient(135deg,#ff6b8a,#4ecdc4)'};color:${p=>p.variant==='secondary'?'#333':'#fff'};display:flex;align-items:center;justify-content:center;gap:6px;transition:transform .25s,box-shadow .25s;&:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,0.18);} &:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}`;
const JoinForm = styled.form`display:flex;flex-direction:column;gap:18px;`;
const Input = styled.input`padding:15px 18px;font-size:20px;letter-spacing:4px;text-transform:uppercase;text-align:center;border:2px solid #d9dee4;border-radius:18px;font-weight:600;outline:none;transition:border-color .25s,box-shadow .25s;background:#fff;&:focus{border-color:#ff6b8a;box-shadow:0 0 0 4px rgba(255,107,138,.25);} `;
const Alert = styled.div`margin-top:18px;padding:14px 18px;border-radius:16px;font-size:14px;font-weight:500;line-height:1.4;background:${p=>p.type==='error'?'#ffe4e8':p.type==='success'?'#e6fff5':'#f1f4f8'};color:${p=>p.type==='error'?'#b50024':p.type==='success'?'#036245':'#39424e'};`;
const Small = styled.div`margin-top:10px;font-size:12px;color:#7a838c;text-align:center;`;

export default function OnboardingCouple(){
  const [loadingCreate,setLoadingCreate]=useState(false);
  const [loadingJoin,setLoadingJoin]=useState(false);
  const [inviteCode,setInviteCode]=useState('');
  const [existing,setExisting]=useState(false);
  const [joinCode,setJoinCode]=useState('');
  const [message,setMessage]=useState(null); // {type:'success'|'error'|'info', text:string}

  // Récupère code existant si déjà créé coté backend
  useEffect(()=>{(async()=>{try{const cm=await coupleService.me(); if(cm.invite_code){setInviteCode(cm.invite_code);setExisting(true);} if(cm.in_couple){ // déjà en couple -> skip page
      window.location.href='/';
    }}catch{/* ignoré */}})();},[]);

  const createOrRefresh=async(refresh=false)=>{
    setMessage(null);setLoadingCreate(true);
    try{
      let code=inviteCode;
      if(!code || refresh){
        // create renvoie un code (dans notre backend logique: crée le couple si inexistant ou refresh invite)
        const res=await coupleService.create();
        code=res.invite_code || res.code || res.invite || '';
      }
      if(!code) throw new Error('Code indisponible');
      setInviteCode(code);
      setExisting(true);
      setMessage({type:'success',text:'Code prêt ! Partage-le à ton/ta partenaire.'});
    }catch(e){
      setMessage({type:'error',text:"Impossible de générer le code"});
    }
    setLoadingCreate(false);
  };

  const copy=()=>{
    if(!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(()=>{
      setMessage({type:'success',text:'Code copié dans le presse-papier'});
    });
  };

  const share=async()=>{
    if(!inviteCode) return;
    const url=`${window.location.origin}/onboarding-couple?code=${inviteCode}`;
    if(navigator.share){
      try{await navigator.share({title:'Rejoins-moi 💞',text:`Code: ${inviteCode}`,url});}catch{/* annulé */}
    }else{
      navigator.clipboard.writeText(url);setMessage({type:'success',text:'Lien copié (partage manuel)'});
    }
  };

  const handleJoin=async(e)=>{
    e.preventDefault();
    setMessage(null);setLoadingJoin(true);
    try{
      const code=joinCode.trim().toUpperCase();
      if(code.length!==6) throw new Error('Code invalide');
      await coupleService.join(code);
      setMessage({type:'success',text:'C’est bon ! Redirection...'});
      setTimeout(()=>window.location.href='/',800);
    }catch(err){
      setMessage({type:'error',text:err.response?.data?.message||'Code invalide ou déjà utilisé'});
    }
    setLoadingJoin(false);
  };

  return (
    <Wrapper>
      {/* Panneau Création / Partage */}
      <Panel>
        <Title>Créer & partager</Title>
        <Sub>Génère un code si tu es le premier. Envoie-le ou partage directement le lien.</Sub>
        {inviteCode ? <CodeBox>{inviteCode}</CodeBox> : <CodeBox style={{opacity:.4,fontSize:24,letterSpacing:2}}>AUCUN CODE</CodeBox>}
        {existing && !message && (
          <Small style={{marginTop:4,color:'#036245'}}>Un code existe déjà – partage-le ou régénère.</Small>
        )}
        <ButtonsRow>
          <Btn type="button" onClick={()=>createOrRefresh(false)} disabled={loadingCreate}>{loadingCreate? '...':'Générer'}</Btn>
          <Btn type="button" onClick={()=>createOrRefresh(true)} variant="secondary" disabled={loadingCreate || !inviteCode}>Refresh</Btn>
          <Btn type="button" onClick={copy} variant="secondary" disabled={!inviteCode}>Copier</Btn>
          <Btn type="button" onClick={share} variant="secondary" disabled={!inviteCode}>Partager</Btn>
        </ButtonsRow>
        {existing && (
          <ButtonsRow style={{marginTop:10}}>
            <Btn type="button" variant="secondary" onClick={()=>window.location.reload()}>Vérifier si reliés</Btn>
          </ButtonsRow>
        )}
        <Small>Le code reste valide tant que vous n’êtes pas encore liés.</Small>
      </Panel>

      {/* Panneau Rejoindre */}
      <Panel>
        <Title>Rejoindre</Title>
        <Sub>Entre le code que ton/ta partenaire t’a envoyé pour vous relier.</Sub>
        <JoinForm onSubmit={handleJoin}>
          <Input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={6} />
          <ButtonsRow style={{marginTop:0}}>
            <Btn type="submit" disabled={loadingJoin || joinCode.length!==6}>{loadingJoin? '...' : 'Rejoindre'}</Btn>
            <Btn type="button" variant="secondary" onClick={()=>setJoinCode('')}>Effacer</Btn>
          </ButtonsRow>
        </JoinForm>
        <Small>Le code fait 6 caractères (A‑Z, 0‑9).</Small>
      </Panel>

      {message && <Alert type={message.type}>{message.text}</Alert>}
    </Wrapper>
  );
}
