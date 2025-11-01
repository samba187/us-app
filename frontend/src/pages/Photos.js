import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div` padding:15px; max-width:900px; margin:0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Grid = styled.div` display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; `;
const Img = styled.img` width:100%; height:100%; object-fit:cover; border-radius:10px; `;
const Card = styled.div` background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:14px; box-shadow:var(--shadow); margin-bottom:12px; `;

export default function Photos() {
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const r = await authService.api.get('/api/photos'); setItems(r.data); }
    catch(e){ console.error(e); }
  };

  const upload = async () => {
    if (files.length === 0) return;
    try { await authService.photoService.uploadMultipart(files); setFiles([]); await load(); }
    catch(e){ alert('Upload échoué'); }
  };

  return (
    <Container>
      <Title>Photos</Title>
      <Card>
        <input type="file" accept="image/*" multiple onChange={(e)=>setFiles(Array.from(e.target.files))} />
        <div style={{height:8}} />
        <button onClick={upload}>Envoyer</button>
      </Card>
      {items.length === 0 ? (
        <div className="skeleton" style={{height:180, borderRadius:14}} />
      ) : (
        <Grid>
          {items.map(p => (
            <div key={p._id}>
              <Img src={p.url} alt="" />
            </div>
          ))}
        </Grid>
      )}
    </Container>
  );
}


