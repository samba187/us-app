import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div`
  padding: 15px; max-width: 800px; margin: 0 auto;
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;
`;
const Title = styled.h1` margin:0; font-size:24px; color:var(--text-color); `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;
const Row = styled.div` display:flex; gap:8px; align-items:center; `;
const Input = styled.input` flex:1; padding:10px; border:2px solid var(--border-color); border-radius:8px; `;
const Select = styled.select` padding:10px; border:2px solid var(--border-color); border-radius:8px; `;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function Reminders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const r = await authService.api.get('/api/reminders'); setItems(r.data); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  const add = async () => {
    if (!title.trim()) return;
    try {
      await authService.api.post('/api/reminders', { title, priority });
      setTitle(''); setPriority('normal'); await load();
    } catch(e) { alert('Erreur: ' + (e?.response?.data?.error || e.message)); }
  };

  const toggle = async (id, status) => {
    try { await authService.api.put(`/api/reminders/${id}`, { status: status==='pending'?'done':'pending' }); await load(); }
    catch(e){ console.error(e); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce rappel ?')) return;
    try { await authService.api.delete(`/api/reminders/${id}`); await load(); }
    catch(e){ console.error(e); }
  };

  return (
    <Container>
      <Header>
        <Title>Rappels</Title>
        <div />
      </Header>

      <Card>
        <Row>
          <Input placeholder="Titre du rappel" value={title} onChange={e=>setTitle(e.target.value)} />
          <Select value={priority} onChange={e=>setPriority(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </Select>
          <Button onClick={add}>Ajouter</Button>
        </Row>
      </Card>

      {loading ? (
        <>
          <div className="skeleton" style={{height:88, borderRadius:14, marginBottom:12}} />
          <div className="skeleton" style={{height:88, borderRadius:14}} />
        </>
      ) : items.map(it => (
        <Card key={it._id}>
          <Row style={{justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:600}}>{it.title}</div>
              <div style={{opacity:.8, fontSize:13}}>Priorité: {it.priority} • Statut: {it.status}</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>toggle(it._id, it.status)}>Basculer</button>
              <button onClick={()=>remove(it._id)} style={{color:'#e74c3c'}}>Supprimer</button>
            </div>
          </Row>
        </Card>
      ))}
    </Container>
  );
}


