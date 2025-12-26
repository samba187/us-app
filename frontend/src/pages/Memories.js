import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCalendar, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { authService } from '../services/authService';
import CommentsSection from '../components/CommentsSection';
import ReactionsBar from '../components/ReactionsBar';

const Container = styled.div`
  padding: 20px 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AddButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 20px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MemoryCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -25px;
    top: 24px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--neon-1);
    box-shadow: 0 0 10px var(--neon-1);
  }
`;

const MemoryDate = styled.div`
  font-size: 13px;
  color: var(--muted-text);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MemoryTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--text-color);
`;

const MemoryContent = styled.p`
  color: var(--text-color);
  line-height: 1.6;
  margin: 0 0 16px 0;
  white-space: pre-wrap;
`;

const MemoryImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--muted-text);
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-color);
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1d2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: #fff;
  margin-bottom: 16px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: #fff;
  margin-bottom: 16px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
`;

export default function Memories() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', date: '', photo_url: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await authService.api.get('/api/memories');
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!form.title) return;
    try {
      const payload = {
        ...form,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
      };

      if (editing) {
        await authService.api.put(`/api/memories/${editing._id}`, payload);
      } else {
        await authService.api.post('/api/memories', payload);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', content: '', date: '', photo_url: '' });
      load();
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce souvenir ?')) return;
    try {
      await authService.api.delete(`/api/memories/${id}`);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setForm({
        title: item.title,
        content: item.content,
        date: item.date ? item.date.split('T')[0] : '',
        photo_url: item.photo_url
      });
    } else {
      setEditing(null);
      setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], photo_url: '' });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await authService.photoService.uploadMultipart([file]);
      if (res && res[0]) {
        setForm({ ...form, photo_url: res[0].url });
      }
    } catch (e) {
      console.error(e);
      alert('Erreur upload');
    }
    setUploading(false);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    return `${API_BASE}${url}`;
  };

  return (
    <Container>
      <Header>
        <Title>Souvenirs</Title>
        <AddButton onClick={() => openModal()}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <Timeline>
        {items.map(item => (
          <MemoryCard key={item._id}>
            <MemoryDate>
              <FiCalendar />
              {new Date(item.date).toLocaleDateString('fr-FR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </MemoryDate>
            <MemoryTitle>{item.title}</MemoryTitle>
            {item.photo_url && (
              <MemoryImage src={getImageUrl(item.photo_url)} alt="" />
            )}
            {item.content && <MemoryContent>{item.content}</MemoryContent>}

            <ReactionsBar targetType="memory" targetId={item._id} />
            <CommentsSection targetType="memory" targetId={item._id} />

            <Actions>
              <ActionButton onClick={() => openModal(item)}>
                <FiEdit2 />
              </ActionButton>
              <ActionButton onClick={() => handleDelete(item._id)}>
                <FiTrash2 />
              </ActionButton>
            </Actions>
          </MemoryCard>
        ))}
      </Timeline>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              {editing ? 'Modifier le souvenir' : 'Nouveau souvenir'}
            </h2>
            <Input
              placeholder="Titre"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <TextArea
              placeholder="Racontez ce moment..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--muted-text)' }}>
                Photo (optionnelle)
              </label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <div style={{ fontSize: 12 }}>Upload en cours...</div>}
              {form.photo_url && (
                <img
                  src={getImageUrl(form.photo_url)}
                  alt="Preview"
                  style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={uploading || !form.title}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', opacity: (uploading || !form.title) ? 0.5 : 1 }}
              >
                Sauvegarder
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
