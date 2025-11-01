import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:800px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;
const Input = styled.textarea` width:100%; min-height:80px; padding:10px; border:2px solid var(--border-color); border-radius:8px; `;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function Notes() {
  const [items, setItems] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const r = await authService.api.get('/api/notes'); setItems(r.data); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  const add = async () => {
    if (!content.trim()) return;
    try { await authService.api.post('/api/notes', { content }); setContent(''); await load(); }
    catch(e){ alert('Erreur: ' + (e?.response?.data?.error || e.message)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try { await authService.api.delete(`/api/notes/${id}`); await load(); }
    catch(e){ console.error(e); }
  };

  return (
    <Container>
      <Title>Notes</Title>
      <Card>
        <Input placeholder="Écrire une note..." value={content} onChange={e=>setContent(e.target.value)} />
        <div style={{height:8}} />
        <Button onClick={add}>Ajouter</Button>
      </Card>
      {loading ? (
        <>
          <div className="skeleton" style={{height:140, borderRadius:14, marginBottom:12}} />
          <div className="skeleton" style={{height:80, borderRadius:14}} />
        </>
      ) : items.map(it => (
        <Card key={it._id}>
          <div style={{whiteSpace:'pre-wrap'}}>{it.content}</div>
          <div style={{textAlign:'right'}}>
            <button onClick={()=>remove(it._id)} style={{color:'#e74c3c'}}>Supprimer</button>
          </div>
        </Card>
      ))}
    </Container>
  );
}


