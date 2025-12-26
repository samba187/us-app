import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUpload, FiImage, FiX, FiSave, FiFolder, FiPlus, FiEdit2, FiTrash2, FiDownload, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { authService } from '../services/authService';
import CommentsSection from '../components/CommentsSection';
import ReactionsBar from '../components/ReactionsBar';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  padding: 20px 16px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 16px 12px; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${p => p.variant === 'primary'
    ? 'linear-gradient(135deg, var(--neon-1), var(--neon-3))'
    : 'var(--card-bg)'
  };
  border: 1px solid ${p => p.variant === 'primary' ? 'transparent' : 'var(--border-color)'};
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${p => p.variant === 'primary' ? '0 6px 20px rgba(124, 58, 237, 0.4)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.variant === 'primary' ? '0 8px 28px rgba(124, 58, 237, 0.5)' : '0 4px 12px rgba(0,0,0,0.2)'};
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(124, 58, 237, 0.4);
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: ${p => p.active ? 'rgba(124, 58, 237, 0.2)' : 'transparent'};
  color: ${p => p.active ? 'var(--primary-color)' : 'var(--muted-text)'};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px 12px 0 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 3px solid ${p => p.active ? 'var(--primary-color)' : 'transparent'};

  &:hover {
    background: rgba(124, 58, 237, 0.15);
    color: var(--text-color);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
`;

const AlbumCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(124, 58, 237, 0.3);
    border-color: rgba(124, 58, 237, 0.4);
  }
`;

const AlbumCover = styled.div`
  height: 180px;
  background: ${({ cover }) =>
    cover
      ? `url(${cover})`
      : 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(255,107,138,0.3))'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const AlbumInfo = styled.div`
  padding: 16px;
`;

const AlbumTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-color);
`;

const AlbumMeta = styled.div`
  font-size: 13px;
  color: var(--muted-text);
`;

const PhotoCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(124, 58, 237, 0.3);
    border-color: rgba(124, 58, 237, 0.4);
  }
`;

const PhotoImg = styled.div`
  width: 100%;
  padding-top: 100%;
  background: ${({ src }) => src ? `url(${src})` : 'rgba(255, 255, 255, 0.04)'};
  background-size: cover;
  background-position: center;
  position: relative;

  &:hover::after {
    content: '👁️';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    background: rgba(0,0,0,0.7);
    padding: 16px;
    border-radius: 50%;
    backdrop-filter: blur(10px);
  }
`;

const PhotoCaption = styled.div`
  padding: 12px;
  font-size: 13px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-start;
  }
`;

const ModalContent = styled.div`
  background: rgba(15, 18, 33, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.06);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.06);
  }

  &::placeholder {
    color: var(--muted-text);
  }
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 40px 20px;
  border: 2px dashed rgba(124, 58, 237, 0.4);
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  color: var(--text-color);
  font-weight: 600;

  &:hover {
    border-color: var(--primary-color);
    background: rgba(124, 58, 237, 0.15);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const PreviewCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewImg = styled.div`
  width: 100%;
  padding-top: 100%;
  background: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
`;

const RemovePreviewButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(124, 58, 237, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--muted-text);
`;

// Viewer Modal
const ViewerModal = styled.div`
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
    flex-direction: column;
  }
`;

const ViewerContent = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 100vh;
    max-width: 100%;
  }
`;

const ViewerImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 0;
    flex: none;
    height: 60vh;
  }
`;

const ViewerImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ViewerCloseButton = styled.button`
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

const ViewerSidebar = styled.div`
  width: 400px;
  background: rgba(15, 18, 33, 0.98);
  border-radius: 16px;
  padding: 24px;
  overflow-y: auto;
  
  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    flex: 1;
  }
`;

const ViewerTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
`;

const ViewerMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--muted-text);
`;

const ViewerActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const ViewerActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: ${p => p.variant === 'primary'
    ? 'linear-gradient(135deg, var(--neon-1), var(--neon-3))'
    : 'rgba(255, 255, 255, 0.06)'
  };
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  }
`;

const getPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  return `${API_BASE}${url}`;
};

export default function Photos() {
  const [view, setView] = useState('albums'); // 'albums' or 'all'
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);

  // Forms
  const [albumForm, setAlbumForm] = useState({ title: '', description: '' });
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadAlbum, setUploadAlbum] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAlbums();
    loadPhotos();
  }, []);

  const loadAlbums = async () => {
    try {
      const res = await authService.api.get('/api/albums');
      setAlbums(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadPhotos = async (albumId = null) => {
    try {
      const res = await authService.api.get('/api/photos');
      let items = res.data || [];
      if (albumId) {
        items = items.filter(p => p.album_id === albumId);
      }
      setPhotos(items);
    } catch (e) {
      console.error(e);
    }
  };

  const openAlbum = (album) => {
    setCurrentAlbum(album);
    loadPhotos(album._id);
    setView('album-view');
  };

  const backToAlbums = () => {
    setCurrentAlbum(null);
    setView('albums');
    loadPhotos();
  };

  const createAlbum = async () => {
    if (!albumForm.title.trim()) return;
    try {
      await authService.api.post('/api/albums', albumForm);
      setAlbumForm({ title: '', description: '' });
      setShowAlbumModal(false);
      await loadAlbums();
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  };

  const deleteAlbum = async (id) => {
    if (!window.confirm('Supprimer cet album ? Les photos seront conservées.')) return;
    try {
      await authService.api.delete(`/api/albums/${id}`);
      await loadAlbums();
      if (currentAlbum?._id === id) backToAlbums();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadFiles(files);

    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target.result);
        if (newPreviews.length === files.length) {
          setUploadPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();
      uploadFiles.forEach(file => formData.append('files', file));
      if (uploadCaption) formData.append('caption', uploadCaption);
      if (uploadAlbum) formData.append('album_id', uploadAlbum);
      if (uploadDate) formData.append('taken_at', new Date(uploadDate).toISOString());

      const token = localStorage.getItem('access_token');
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/photos`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      setUploadFiles([]);
      setUploadPreviews([]);
      setUploadCaption('');
      setUploadDate('');
      setUploadAlbum('');
      setShowUploadModal(false);

      if (currentAlbum) {
        await loadPhotos(currentAlbum._id);
      } else {
        await loadPhotos();
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'upload: ' + e.message);
    }
    setUploading(false);
  };

  const updatePhoto = async () => {
    if (!editingPhoto) return;
    try {
      await authService.api.put(`/api/photos/${editingPhoto._id}`, {
        caption: editingPhoto.caption || '',
        album_id: editingPhoto.album_id || null,
        taken_at: editingPhoto.taken_at ? new Date(editingPhoto.taken_at).toISOString() : null
      });
      setEditingPhoto(null);
      if (currentAlbum) {
        await loadPhotos(currentAlbum._id);
      } else {
        await loadPhotos();
      }
    } catch (e) {
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    try {
      await authService.api.delete(`/api/photos/${id}`);
      if (currentAlbum) {
        await loadPhotos(currentAlbum._id);
      } else {
        await loadPhotos();
      }
      if (viewingPhoto?._id === id) setViewingPhoto(null);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPhoto = (url) => {
    const link = document.createElement('a');
    link.href = getPhotoUrl(url);
    link.download = url.split('/').pop() || 'photo.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAlbumPhotoCount = (albumId) => {
    return photos.filter(p => p.album_id === albumId).length;
  };

  const getAlbumCover = (albumId) => {
    const albumPhotos = photos.filter(p => p.album_id === albumId);
    return albumPhotos[0]?.url || null;
  };

  const displayedPhotos = currentAlbum
    ? photos.filter(p => p.album_id === currentAlbum._id)
    : view === 'all'
      ? photos
      : [];

  return (
    <Container>
      <Header>
        <Title>{currentAlbum ? currentAlbum.title : 'Photos'}</Title>
        <Actions>
          {currentAlbum && (
            <Button onClick={backToAlbums}>
              <FiFolder /> Retour aux albums
            </Button>
          )}
          {!currentAlbum && (
            <Button onClick={() => setShowAlbumModal(true)}>
              <FiPlus /> Nouvel album
            </Button>
          )}
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <FiUpload /> Upload
          </Button>
        </Actions>
      </Header>

      {!currentAlbum && (
        <TabBar>
          <Tab active={view === 'albums'} onClick={() => setView('albums')}>
            <FiFolder /> Albums
          </Tab>
          <Tab active={view === 'all'} onClick={() => setView('all')}>
            <FiImage /> Toutes les photos
          </Tab>
        </TabBar>
      )}

      {loading ? (
        <Grid>
          <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />
        </Grid>
      ) : view === 'albums' && !currentAlbum ? (
        albums.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📁</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun album</div>
            <div>Créez votre premier album pour organiser vos photos</div>
          </EmptyState>
        ) : (
          <Grid>
            {albums.map(album => (
              <AlbumCard key={album._id} onClick={() => openAlbum(album)}>
                <AlbumCover cover={getPhotoUrl(getAlbumCover(album._id))}>
                  {!getAlbumCover(album._id) && '📁'}
                </AlbumCover>
                <AlbumInfo>
                  <AlbumTitle>{album.title}</AlbumTitle>
                  <AlbumMeta>{getAlbumPhotoCount(album._id)} photo(s)</AlbumMeta>
                </AlbumInfo>
              </AlbumCard>
            ))}
          </Grid>
        )
      ) : (
        displayedPhotos.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📸</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucune photo</div>
            <div>Uploadez vos premières photos</div>
          </EmptyState>
        ) : (
          <Grid>
            {displayedPhotos.map(photo => (
              <PhotoCard key={photo._id} onClick={() => setViewingPhoto(photo)}>
                <PhotoImg src={getPhotoUrl(photo.url)} />
                {photo.caption && <PhotoCaption>{photo.caption}</PhotoCaption>}
              </PhotoCard>
            ))}
          </Grid>
        )
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowAlbumModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Nouvel album</ModalTitle>
              <CloseButton onClick={() => setShowAlbumModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormField>
                <Label>Titre *</Label>
                <Input
                  placeholder="Vacances 2024, Anniversaire..."
                  value={albumForm.title}
                  onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })}
                />
              </FormField>
              <FormField>
                <Label>Description</Label>
                <TextArea
                  placeholder="Une description optionnelle..."
                  value={albumForm.description}
                  onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
                />
              </FormField>
              <SaveButton onClick={createAlbum}>
                <FiSave /> Créer l'album
              </SaveButton>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Uploader des photos</ModalTitle>
              <CloseButton onClick={() => setShowUploadModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormField>
                <FileInputLabel>
                  <FileInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                  📸 {uploadFiles.length > 0 ? `${uploadFiles.length} photo(s) sélectionnée(s)` : 'Choisir des photos'}
                </FileInputLabel>
                {uploadPreviews.length > 0 && (
                  <PreviewGrid>
                    {uploadPreviews.map((preview, idx) => (
                      <PreviewCard key={idx}>
                        <PreviewImg src={preview} />
                        <RemovePreviewButton onClick={() => removePreview(idx)}>
                          ✕
                        </RemovePreviewButton>
                      </PreviewCard>
                    ))}
                  </PreviewGrid>
                )}
              </FormField>
              <FormField>
                <Label>Album</Label>
                <Input
                  as="select"
                  value={uploadAlbum}
                  onChange={e => setUploadAlbum(e.target.value)}
                >
                  <option value="">Aucun album</option>
                  {albums.map(album => (
                    <option key={album._id} value={album._id}>{album.title}</option>
                  ))}
                </Input>
              </FormField>
              <FormField>
                <Label>Légende (commune à toutes)</Label>
                <Input
                  placeholder="Une belle journée..."
                  value={uploadCaption}
                  onChange={e => setUploadCaption(e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Date de prise de vue</Label>
                <Input
                  type="date"
                  value={uploadDate}
                  onChange={e => setUploadDate(e.target.value)}
                />
              </FormField>
              <SaveButton onClick={uploadPhotos} disabled={uploading || uploadFiles.length === 0}>
                <FiUpload /> {uploading ? 'Upload en cours...' : 'Uploader'}
              </SaveButton>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Photo Viewer */}
      {viewingPhoto && (
        <ViewerModal onClick={(e) => e.target === e.currentTarget && setViewingPhoto(null)}>
          <ViewerContent>
            <ViewerImageContainer>
              <ViewerCloseButton onClick={() => setViewingPhoto(null)}>
                <FiX size={24} />
              </ViewerCloseButton>
              <ViewerImage src={getPhotoUrl(viewingPhoto.url)} alt="" />
            </ViewerImageContainer>
            <ViewerSidebar>
              <ViewerTitle>Détails</ViewerTitle>
              {viewingPhoto.caption && (
                <ViewerMeta>
                  <FiMessageSquare />
                  {viewingPhoto.caption}
                </ViewerMeta>
              )}
              {viewingPhoto.taken_at && (
                <ViewerMeta>
                  <FiCalendar />
                  {new Date(viewingPhoto.taken_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </ViewerMeta>
              )}
              {viewingPhoto.uploaded_at && (
                <ViewerMeta>
                  <FiUpload />
                  Uploadée le {new Date(viewingPhoto.uploaded_at).toLocaleDateString('fr-FR')}
                </ViewerMeta>
              )}

              <ReactionsBar targetType="photo" targetId={viewingPhoto._id} />
              <CommentsSection targetType="photo" targetId={viewingPhoto._id} />

              <ViewerActions>
                <ViewerActionButton variant="primary" onClick={() => downloadPhoto(viewingPhoto.url)}>
                  <FiDownload /> Télécharger
                </ViewerActionButton>
                <ViewerActionButton onClick={() => { setEditingPhoto(viewingPhoto); setViewingPhoto(null); }}>
                  <FiEdit2 /> Modifier
                </ViewerActionButton>
                <ViewerActionButton onClick={() => { deletePhoto(viewingPhoto._id); }}>
                  <FiTrash2 /> Supprimer
                </ViewerActionButton>
              </ViewerActions>
            </ViewerSidebar>
          </ViewerContent>
        </ViewerModal>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <Modal onClick={(e) => e.target === e.currentTarget && setEditingPhoto(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Modifier la photo</ModalTitle>
              <CloseButton onClick={() => setEditingPhoto(null)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: 20 }}>
                <PhotoImg src={getPhotoUrl(editingPhoto.url)} style={{ height: 200, paddingTop: 0 }} />
              </div>
              <FormField>
                <Label>Légende</Label>
                <TextArea
                  placeholder="Une belle photo..."
                  value={editingPhoto.caption || ''}
                  onChange={e => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                />
              </FormField>
              <FormField>
                <Label>Album</Label>
                <Input
                  as="select"
                  value={editingPhoto.album_id || ''}
                  onChange={e => setEditingPhoto({ ...editingPhoto, album_id: e.target.value || null })}
                >
                  <option value="">Aucun album</option>
                  {albums.map(album => (
                    <option key={album._id} value={album._id}>{album.title}</option>
                  ))}
                </Input>
              </FormField>
              <FormField>
                <Label>Date de prise de vue</Label>
                <Input
                  type="date"
                  value={editingPhoto.taken_at ? new Date(editingPhoto.taken_at).toISOString().split('T')[0] : ''}
                  onChange={e => setEditingPhoto({ ...editingPhoto, taken_at: e.target.value })}
                />
              </FormField>
              <SaveButton onClick={updatePhoto}>
                <FiSave /> Sauvegarder
              </SaveButton>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
