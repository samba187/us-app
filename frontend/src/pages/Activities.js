import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:800px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Card = styled.div` 
  background: var(--card-bg); 
  border: 1px solid var(--border-color); 
  border-radius: 14px; 
  padding: 14px; 
  box-shadow: 0 6px 20px rgba(0,0,0,0.15); 
  margin-bottom: 12px;
  
  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;
const Row = styled.div` display:flex; gap:8px; align-items:center; flex-wrap:wrap; `;
const Input = styled.input` 
  flex:1; 
  min-width:180px; 
  padding:10px; 
  border:2px solid var(--border-color); 
  border-radius:8px; 
  background: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }
  
  &::placeholder {
    color: var(--muted-text);
  }
`;
const Select = styled.select` 
  padding:10px; 
  border:2px solid var(--border-color); 
  border-radius:8px; 
  background: var(--card-bg);
  color: var(--text-color);

  option {
    background: #1a1d2e;
    color: var(--text-color);
    padding: 10px;
  }

  option:checked {
    background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
    color: #fff;
  }
`;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function Activities() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [status, setStatus] = useState('planned');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await authService.api.get('/api/activities'); setItems(r.data); }
    catch (e) { console.error(e); }
  };

  const add = async () => {
    if (!title.trim()) return;
    try { await authService.api.post('/api/activities', { title, category, status }); setTitle(''); setCategory('other'); setStatus('planned'); await load(); }
    catch (e) { alert('Erreur: ' + (e?.response?.data?.error || e.message)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette activité ?')) return;
    try { await authService.api.delete(`/api/activities/${id}`); await load(); }
    catch (e) { console.error(e); }
  };

  return (
    <Container>
      <Title>Activités</Title>
      <Card>
        <Row>
          <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <Select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="other">Autre</option>
            <option value="outdoor">Outdoor</option>
            <option value="cinema">Cinéma</option>
            <option value="trip">Voyage</option>
          </Select>
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="planned">Prévu</option>
            <option value="done">Fait</option>
          </Select>
          <Button onClick={add}>Ajouter</Button>
        </Row>
      </Card>

      {items.map(it => (
        <Card key={it._id}>
          <div style={{ fontWeight: 600 }}>{it.title}</div>
          <div style={{ opacity: .8, fontSize: 13 }}>Catégorie: {it.category} • Statut: {it.status}</div>
          <div style={{ textAlign: 'right' }}>
            <button onClick={() => remove(it._id)} style={{ color: '#e74c3c' }}>Supprimer</button>
          </div>
        </Card>
      ))}
    </Container>
  );
}


