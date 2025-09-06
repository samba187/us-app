import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { coupleService } from '../services/authService';

const Wrap = styled.div`padding:24px;padding-bottom:120px;max-width:600px;margin:0 auto;`;
const Card = styled.div`background:#fff;border-radius:24px;padding:28px;box-shadow:0 8px 24px -6px rgba(0,0,0,.12);margin-bottom:24px;`;
const Title = styled.h1`margin:0 0 18px;font-size:28px;background:linear-gradient(135deg,#ff6b8a,#4ecdc4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;`;
const Row = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;`;
const CodeBox = styled.div`font-family:monospace;font-size:20px;letter-spacing:4px;padding:12px 16px;border:2px dashed #d5dbe1;border-radius:14px;user-select:all;background:#f5f7f9;`;
const Btn = styled.button`padding:12px 18px;border:none;border-radius:14px;font-weight:600;background:${p=>p.variant==='danger'?'#ff6b8a':'linear-gradient(135deg,#ff6b8a,#4ecdc4)'};color:#fff;cursor:pointer;`;

export default function Profile({onLogout}){
  const [me,setMe]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{try{const r=await coupleService.me(); setMe(r);}finally{setLoading(false);}})();},[]);
  if(loading) return <Wrap>Chargement…</Wrap>;
  const partner = (me?.members||[]).length>1 ? me.members.find(m=>m.email !== (JSON.parse(localStorage.getItem('us_user')||'{}')?.email)) : null;
  const inviteCode = me?.invite_code;
  return <Wrap>
    <Card>
      <Title>Profil</Title>
      <Row><strong>Vous</strong><span>{JSON.parse(localStorage.getItem('us_user')||'{}')?.name}</span></Row>
      {partner && <Row><strong>Partenaire</strong><span>{partner.name}</span></Row>}
      {!partner && inviteCode && <div style={{marginTop:16}}>
        <div style={{fontSize:14,marginBottom:6}}>Code d'invitation à partager :</div>
        <CodeBox>{inviteCode}</CodeBox>
      </div>}
      <div style={{marginTop:28}}>
        <Btn variant="danger" onClick={()=>{if(window.confirm('Se déconnecter ?')){localStorage.removeItem('us_token');localStorage.removeItem('us_user');window.location.href='/'}}}>Déconnexion</Btn>
      </div>
    </Card>
  </Wrap>;
}
