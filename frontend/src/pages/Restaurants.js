import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:800px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;
const Row = styled.div` display:flex; gap:8px; align-items:center; flex-wrap:wrap; `;
const Input = styled.input` flex:1; min-width:180px; padding:10px; border:2px solid var(--border-color); border-radius:8px; `;
const Button = styled.button` padding:10px 14px; border:none; border-radius:8px; background:var(--primary-color); color:#fff; cursor:pointer; `;

export default function Restaurants() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const r = await authService.api.get('/api/restaurants'); setItems(r.data); }
    catch(e){ console.error(e); }
  };

  const add = async () => {
    if (!name.trim()) return;
    try { await authService.api.post('/api/restaurants', { name, address, map_url: mapUrl }); setName(''); setAddress(''); setMapUrl(''); await load(); }
    catch(e){ alert('Erreur: ' + (e?.response?.data?.error || e.message)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce restaurant ?')) return;
    try { await authService.api.delete(`/api/restaurants/${id}`); await load(); }
    catch(e){ console.error(e); }
  };

  return (
    <Container>
      <Title>Restaurants</Title>
      <Card>
        <Row>
          <Input placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Adresse" value={address} onChange={e=>setAddress(e.target.value)} />
          <Input placeholder="Lien carte (Google Maps)" value={mapUrl} onChange={e=>setMapUrl(e.target.value)} />
          <Button onClick={add}>Ajouter</Button>
        </Row>
      </Card>

      {items.map(it => (
        <Card key={it._id}>
          <div style={{fontWeight:600}}>{it.name}</div>
          <div style={{opacity:.8, fontSize:13}}>{it.address}</div>
          {it.map_url && <a href={it.map_url} target="_blank" rel="noreferrer">Voir sur la carte</a>}
          <div style={{textAlign:'right'}}>
            <button onClick={()=>remove(it._id)} style={{color:'#e74c3c'}}>Supprimer</button>
          </div>
        </Card>
      ))}
    </Container>
  );
}


