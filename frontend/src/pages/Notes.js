import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { authService } from '../services/authService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  padding: 20px 16px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 16px 12px; }
`;

const Title = styled.h1`
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease-out;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NoteCard = styled(Card)`
  position: relative;
`;

const NoteContent = styled.div`
  white-space: pre-wrap;
  color: var(--text-color);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 12px;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(231, 76, 60, 0.5);
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: rgba(231, 76, 60, 0.7);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--muted-text);
  animation: ${fadeIn} 0.4s ease-out;
`;

export default function Notes() {
  const [items, setItems] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await authService.api.get('/api/notes');
      setItems(r.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const add = async () => {
    if (!content.trim()) return;
    try {
      await authService.api.post('/api/notes', { content });
      setContent('');
      await load();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette note ?')) return;
    try {
      await authService.api.delete(`/api/notes/${id}`);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <Title>Notes</Title>
      <Card>
        <Input
          placeholder="Écrire une note..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <Button onClick={add}>
          <FiPlus /> Ajouter
        </Button>
      </Card>
      {loading ? (
        <>
          <div className="skeleton" style={{ height: 140, borderRadius: 18, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 18 }} />
        </>
      ) : items.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucune note</div>
          <div>Ajoutez votre première note ci-dessus</div>
        </EmptyState>
      ) : (
        items.map(it => (
          <NoteCard key={it._id}>
            <NoteContent>{it.content}</NoteContent>
            <div style={{ textAlign: 'right' }}>
              <DeleteButton onClick={() => remove(it._id)}>
                <FiTrash2 /> Supprimer
              </DeleteButton>
            </div>
          </NoteCard>
        ))
      )}
    </Container>
  );
}
