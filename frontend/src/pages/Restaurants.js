import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiMapPin, FiExternalLink, FiTrash2, FiEdit2, FiX, FiSave, FiImage } from 'react-icons/fi';
import { authService } from '../services/authService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  padding: 20px 16px;
  max-width: 900px;
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const AddButton = styled.button`
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
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;

  @supports (backdrop-filter: blur(12px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 36px rgba(124, 58, 237, 0.3);
    border-color: rgba(124, 58, 237, 0.4);
  }
`;

const RestaurantImage = styled.div`
  height: 240px;
  background: ${({ image }) =>
    image
      ? `url(${image})`
      : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(255,107,138,0.4))'};
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 1;
  }

  &:hover::after {
    content: "👁️ Voir en grand";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10;
    backdrop-filter: blur(10px);
  }
`;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  return `${API_BASE}${url}`;
};

const StatusBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: ${p =>
    p.status === 'visited' ? 'rgba(16, 185, 129, 0.9)' :
    p.status === 'favorite' ? 'rgba(255, 107, 138, 0.9)' :
    'rgba(52, 152, 219, 0.9)'
  };
`;

const RestaurantContent = styled.div`
  padding: 20px;
`;

const RestaurantName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--text-color);
`;

const RestaurantAddress = styled.div`
  font-size: 14px;
  color: var(--muted-text);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RestaurantNotes = styled.div`
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 12px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const DeleteButton = styled(ActionButton)`
  border-color: rgba(231, 76, 60, 0.5);
  color: #e74c3c;

  &:hover {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 768px) {
    align-items: flex-start;
    padding-top: 20px;
  }
`;

const ModalContent = styled.div`
  background: rgba(15, 18, 33, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 28px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;

  @supports (backdrop-filter: blur(14px)) {
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

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

const SaveButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--muted-text);
`;

const ViewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-start;
  }
`;

const ViewContent = styled.div`
  background: rgba(15, 18, 33, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;

  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  @media (max-width: 768px) {
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
`;

const ViewImageLarge = styled.div`
  width: 100%;
  height: 600px;
  background: ${({ image }) =>
    image
      ? `url(${image})`
      : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(255,107,138,0.4))'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0,0,0,0.3);
  position: relative;
  border-radius: 24px 24px 0 0;

  @media (max-width: 768px) {
    height: 60vh;
    border-radius: 0;
  }
`;

const ViewCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const ViewDetails = styled.div`
  padding: 32px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const ViewTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ViewBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  background: ${p =>
    p.status === 'visited' ? 'rgba(16, 185, 129, 0.2)' :
    p.status === 'favorite' ? 'rgba(255, 107, 138, 0.2)' :
    'rgba(52, 152, 219, 0.2)'
  };
  color: ${p =>
    p.status === 'visited' ? '#10b981' :
    p.status === 'favorite' ? 'var(--neon-3)' :
    '#3498db'
  };
  border: 1px solid ${p =>
    p.status === 'visited' ? 'rgba(16, 185, 129, 0.3)' :
    p.status === 'favorite' ? 'rgba(255, 107, 138, 0.3)' :
    'rgba(52, 152, 219, 0.3)'
  };
`;

const ViewInfo = styled.div`
  color: var(--muted-text);
  font-size: 15px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewNotes = styled.div`
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.8;
  margin: 20px 0;
  white-space: pre-wrap;
`;

const ViewActions = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ViewActionButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: ${p => p.variant === 'primary' 
    ? 'linear-gradient(135deg, var(--neon-1), var(--neon-3))'
    : 'rgba(255, 255, 255, 0.06)'
  };
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }
`;

export default function Restaurants() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    map_url: '',
    image_url: '',
    images: [],
    status: 'to_try',
    notes: ''
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await authService.api.get('/api/restaurants');
      setItems(r.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item._id);
      setForm({
        name: item.name || '',
        address: item.address || '',
        map_url: item.map_url || '',
        image_url: item.image_url || '',
        images: item.images || [],
        status: item.status || 'to_try',
        notes: item.notes || ''
      });
    } else {
      setEditing(null);
      setForm({ name: '', address: '', map_url: '', image_url: '', images: [], status: 'to_try', notes: '' });
    }
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setImageFiles(files);
    
    // Générer les previews
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target.result);
        if (newPreviews.length === files.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setUploading(true);

    try {
      let finalImages = [...form.images]; // Garder les images existantes

      // Upload des nouvelles images si fichiers sélectionnés
      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} restaurant image(s)...`);
        const uploaded = await authService.photoService.uploadMultipart(imageFiles);
        console.log('Upload response:', uploaded);
        if (uploaded && uploaded.length > 0) {
          const newImageUrls = uploaded.map(img => img.url);
          finalImages = [...finalImages, ...newImageUrls];
          console.log('Final restaurant images:', finalImages);
        }
      }

      // Si pas d'images dans le tableau mais image_url défini, mettre image_url comme première image
      let finalImageUrl = form.image_url;
      if (finalImages.length > 0 && !finalImageUrl) {
        finalImageUrl = finalImages[0];
      }

      const payload = { 
        ...form, 
        image_url: finalImageUrl,
        images: finalImages 
      };
      console.log('Saving restaurant with payload:', payload);

      if (editing) {
        await authService.api.put(`/api/restaurants/${editing}`, payload);
      } else {
        await authService.api.post('/api/restaurants', payload);
      }

      closeModal();
      await load();
    } catch (e) {
      console.error('Save error:', e);
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
    setUploading(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce restaurant ?')) return;
    try {
      await authService.api.delete(`/api/restaurants/${id}`);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'visited': return 'Testé';
      case 'favorite': return 'Favori ❤️';
      case 'to_try': return 'À tester';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Restaurants</Title>
        <AddButton onClick={() => openModal()}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      {loading ? (
        <>
          <div className="skeleton" style={{ height: 280, borderRadius: 18, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 280, borderRadius: 18 }} />
        </>
      ) : items.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun restaurant</div>
          <div>Ajoutez vos restaurants à tester ou vos favoris</div>
        </EmptyState>
      ) : (
        <Grid>
          {items.map(item => (
            <Card key={item._id}>
            <RestaurantImage 
              image={getImageUrl(item.image_url)}
              onClick={() => setViewingItem(item)}
            >
              <StatusBadge status={item.status}>
                {getStatusLabel(item.status)}
              </StatusBadge>
            </RestaurantImage>
            <RestaurantContent>
              <RestaurantName>{item.name}</RestaurantName>
              {item.address && (
                <RestaurantAddress>
                  <FiMapPin size={14} />
                  {item.address}
                </RestaurantAddress>
              )}
              {item.notes && <RestaurantNotes>{item.notes}</RestaurantNotes>}
              <Actions>
                {item.map_url && (
                  <ActionButton as="a" href={item.map_url} target="_blank" rel="noopener noreferrer">
                    <FiMapPin /> Carte
                  </ActionButton>
                )}
                <ActionButton onClick={() => openModal(item)}>
                  <FiEdit2 /> Modifier
                </ActionButton>
                <DeleteButton onClick={() => remove(item._id)}>
                  <FiTrash2 /> Supprimer
                </DeleteButton>
              </Actions>
            </RestaurantContent>
          </Card>
          ))}
        </Grid>
      )}

      {viewingItem && (() => {
        const allImages = viewingItem.images && viewingItem.images.length > 0 
          ? viewingItem.images 
          : viewingItem.image_url 
            ? [viewingItem.image_url] 
            : [];
        const currentImage = allImages[currentImageIndex] || null;

        return (
          <ViewModal onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingItem(null);
              setCurrentImageIndex(0);
            }
          }}>
            <ViewContent>
              <ViewImageLarge image={getImageUrl(currentImage)}>
                <ViewCloseButton onClick={() => { setViewingItem(null); setCurrentImageIndex(0); }}>
                  <FiX size={24} />
                </ViewCloseButton>

                {/* Navigation entre images si plusieurs */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                    >
                      ›
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      padding: '8px 16px',
                      borderRadius: 20,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                      zIndex: 10
                    }}>
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </ViewImageLarge>
              <ViewDetails>
                <ViewTitle>{viewingItem.name}</ViewTitle>
                <ViewBadge status={viewingItem.status}>
                  {getStatusLabel(viewingItem.status)}
                </ViewBadge>
                {viewingItem.address && (
                  <ViewInfo>
                    <FiMapPin size={16} />
                    {viewingItem.address}
                  </ViewInfo>
                )}
                {viewingItem.notes && (
                  <ViewNotes>{viewingItem.notes}</ViewNotes>
                )}

                {/* Miniatures des images */}
                {allImages.length > 1 && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 12 }}>Toutes les photos ({allImages.length})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                      {allImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setCurrentImageIndex(idx)}
                          style={{ 
                            width: '100%', 
                            paddingTop: '100%',
                            borderRadius: 8, 
                            overflow: 'hidden',
                            background: `url(${getImageUrl(img)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            border: currentImageIndex === idx ? '3px solid var(--primary-color)' : '2px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            opacity: currentImageIndex === idx ? 1 : 0.6
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <ViewActions>
                  {viewingItem.map_url && (
                    <ViewActionButton 
                      as="a" 
                      href={viewingItem.map_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      <FiMapPin /> Voir sur la carte
                    </ViewActionButton>
                  )}
                  <ViewActionButton onClick={() => { setViewingItem(null); setCurrentImageIndex(0); openModal(viewingItem); }}>
                    <FiEdit2 /> Modifier
                  </ViewActionButton>
                  <ViewActionButton onClick={() => { setViewingItem(null); setCurrentImageIndex(0); remove(viewingItem._id); }}>
                    <FiTrash2 /> Supprimer
                  </ViewActionButton>
                </ViewActions>
              </ViewDetails>
            </ViewContent>
          </ViewModal>
        );
      })()}

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editing ? 'Modifier' : 'Ajouter'} un restaurant</ModalTitle>
              <CloseButton onClick={closeModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <FormGrid>
              <Input
                placeholder="Nom du restaurant *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Adresse"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
              <Input
                placeholder="Lien Google Maps"
                value={form.map_url}
                onChange={e => setForm({ ...form, map_url: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ 
                  padding: '14px 20px', 
                  background: 'rgba(124, 58, 237, 0.15)', 
                  border: '2px dashed rgba(124, 58, 237, 0.4)', 
                  borderRadius: 12, 
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: 'var(--text-color)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }} 
                    onChange={handleImageSelect}
                  />
                  📸 {imageFiles.length > 0 ? `${imageFiles.length} image(s) sélectionnée(s)` : 'Choisir des images'}
                </label>

                {/* Images existantes (mode édition) */}
                {form.images && form.images.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 8 }}>Images actuelles:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                      {form.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <div style={{ 
                            width: '100%', 
                            paddingTop: '100%',
                            borderRadius: 8, 
                            overflow: 'hidden',
                            background: `url(${getImageUrl(img)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }} />
                          <button
                            onClick={() => removeExistingImage(idx)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nouvelles images (preview) */}
                {imagePreviews.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 8 }}>Nouvelles images:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <div style={{ 
                            width: '100%', 
                            paddingTop: '100%',
                            borderRadius: 8, 
                            overflow: 'hidden',
                            background: `url(${preview})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }} />
                          <button
                            onClick={() => removePreview(idx)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', color: 'var(--muted-text)', fontSize: 13 }}>ou</div>
                <Input
                  placeholder="URL de l'image principale"
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="to_try">À tester</option>
                <option value="visited">Testé</option>
                <option value="favorite">Favori</option>
              </Select>
              <TextArea
                placeholder="Notes, commentaires, plats préférés..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
              <SaveButton onClick={save} disabled={uploading}>
                <FiSave /> {uploading ? 'Upload en cours...' : editing ? 'Sauvegarder' : 'Ajouter'}
              </SaveButton>
            </FormGrid>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
