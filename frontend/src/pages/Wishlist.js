import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiExternalLink, FiTrash2, FiEdit2, FiX, FiSave, FiImage, FiUpload } from 'react-icons/fi';
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
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const AddButton = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(124, 58, 237, 0.5);
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

const WishlistImage = styled.div`
  height: 240px;
  background: ${({ image }) =>
    image
      ? `url(${image})`
      : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(255,107,138,0.4))'};
  background-size: cover;
  background-position: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.03);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  }

  &:hover::before {
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

const StatusBadge = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  z-index: 2;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: ${p =>
    p.status === 'gifted' ? 'rgba(16, 185, 129, 0.85)' :
    p.status === 'bought' ? 'rgba(243, 156, 18, 0.85)' :
    'rgba(52, 152, 219, 0.85)'
  };
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const WishlistContent = styled.div`
  padding: 20px;
`;

const WishlistTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
`;

const ForUser = styled.div`
  color: var(--neon-3);
  font-size: 13px;
  margin: 0 0 12px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Description = styled.p`
  color: var(--muted-text);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 14px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: var(--neon-1);
    background: rgba(124, 58, 237, 0.15);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--neon-1);
    background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
    color: #fff;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const EditButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-color);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    border-color: var(--neon-1);
    background: rgba(124, 58, 237, 0.15);
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(231, 76, 60, 0.5);
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.2);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
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
  background: rgba(15, 18, 33, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;

  @supports (backdrop-filter: blur(16px)) {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: rotate(90deg);
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 16px;
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
  transition: all 0.3s ease;

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

const FileUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: var(--neon-1);
    background: rgba(124, 58, 237, 0.08);
  }
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
`;

const ImagePreview = styled.div`
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  max-height: 200px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(231, 76, 60, 0.9);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e74c3c;
    transform: scale(1.1);
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(124, 58, 237, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
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
  animation: ${fadeIn} 0.3s ease-out;

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

const ViewMeta = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ViewBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${p =>
    p.type === 'status' && p.status === 'gifted' ? 'rgba(16, 185, 129, 0.2)' :
    p.type === 'status' && p.status === 'bought' ? 'rgba(243, 156, 18, 0.2)' :
    p.type === 'status' ? 'rgba(52, 152, 219, 0.2)' :
    'rgba(255, 107, 138, 0.2)'
  };
  color: ${p =>
    p.type === 'status' && p.status === 'gifted' ? '#10b981' :
    p.type === 'status' && p.status === 'bought' ? '#f39c12' :
    p.type === 'status' ? '#3498db' :
    'var(--neon-3)'
  };
  border: 1px solid ${p =>
    p.type === 'status' && p.status === 'gifted' ? 'rgba(16, 185, 129, 0.3)' :
    p.type === 'status' && p.status === 'bought' ? 'rgba(243, 156, 18, 0.3)' :
    p.type === 'status' ? 'rgba(52, 152, 219, 0.3)' :
    'rgba(255, 107, 138, 0.3)'
  };
`;

const ViewDescription = styled.div`
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 24px;
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

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    link_url: '',
    image_url: '',
    for_user: '', // will be user_id
    status: 'idea'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [coupleInfo, setCoupleInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadCoupleInfo();
    load();
  }, []);

  const loadCoupleInfo = async () => {
    try {
      const [meRes, coupleRes] = await Promise.all([
        authService.api.get('/api/me'),
        authService.api.get('/api/couple/me')
      ]);
      setCurrentUserId(meRes.data._id);
      setCoupleInfo(coupleRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const load = async () => {
    try {
      const r = await authService.api.get('/api/wishlist');
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
        title: item.title || '',
        description: item.description || '',
        link_url: item.link_url || '',
        for_user: item.for_user || 'me',
        image_url: item.image_url || '',
        status: item.status || 'idea'
      });
      if (getImageUrl(item)) {
        setImagePreview(getImageUrl(item));
      }
    } else {
      setEditing(null);
      setForm({ title: '', description: '', link_url: '', image_url: '', for_user: currentUserId || '', status: 'idea' });
      setImageFile(null);
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm({ ...form, image_url: '' });
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setUploading(true);
    
    try {
      let finalImageUrl = form.image_url;
      
      // Upload image si fichier sélectionné
      if (imageFile) {
        console.log('Uploading image file...');
        const uploaded = await authService.photoService.uploadMultipart([imageFile]);
        console.log('Upload response:', uploaded);
        if (uploaded && uploaded[0]) {
          // L'API retourne { url: "/uploads/xxx.jpg" }
          finalImageUrl = uploaded[0].url;
          console.log('Final image URL:', finalImageUrl);
        }
      }

      const payload = { ...form, image_url: finalImageUrl };
      console.log('Saving wishlist item with payload:', payload);

      if (editing) {
        await authService.api.put(`/api/wishlist/${editing}`, payload);
      } else {
        await authService.api.post('/api/wishlist', payload);
      }
      
      closeModal();
      await load();
    } catch (e) {
      console.error('Save error:', e);
      alert('Erreur: ' + (e?.response?.data?.error || e.message));
    }
    setUploading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await authService.api.put(`/api/wishlist/${id}`, { status });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      await authService.api.delete(`/api/wishlist/${id}`);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'idea': return 'Idée';
      case 'bought': return 'Acheté';
      case 'gifted': return 'Offert';
      default: return status;
    }
  };

  const getForUserLabel = (for_user_id) => {
    if (!coupleInfo || !for_user_id) return '🎁 Non défini';
    
    if (for_user_id === 'both') return '💑 Pour nous deux';
    
    // Chercher le nom dans les membres du couple
    const member = coupleInfo.members?.find(m => m._id === for_user_id);
    if (member) {
      if (member._id === currentUserId) {
        return `🎁 Pour ${member.name}`;
      } else {
        return `💝 Pour ${member.name}`;
      }
    }
    
    return '🎁 Non défini';
  };

  const getPartnerName = () => {
    if (!coupleInfo || !currentUserId) return 'Partenaire';
    const partner = coupleInfo.members?.find(m => m._id !== currentUserId);
    return partner?.name || 'Partenaire';
  };

  const getMyName = () => {
    if (!coupleInfo || !currentUserId) return 'Moi';
    const me = coupleInfo.members?.find(m => m._id === currentUserId);
    return me?.name || 'Moi';
  };

  const getImageUrl = (item) => {
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    
    let url = null;
    if (item.image_url) {
      url = item.image_url;
    } else if (item.images && item.images[0]) {
      const img = item.images[0];
      if (typeof img === 'string') url = img;
      else if (img.url) url = img.url;
    }
    
    console.log('getImageUrl - item:', item.title, 'url:', url);
    
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    // Si URL relative, ajouter le préfixe API
    const fullUrl = url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
    console.log('getImageUrl - full URL:', fullUrl);
    return fullUrl;
  };

  return (
    <Container>
      <Header>
        <Title>Wishlist</Title>
        <AddButton onClick={() => openModal()}>
          <FiPlus size={20} /> Ajouter
        </AddButton>
      </Header>

      {loading ? (
        <Grid>
          <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
        </Grid>
      ) : items.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎁</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Votre wishlist est vide</div>
          <div style={{ marginBottom: 24 }}>Ajoutez vos idées cadeaux pour vous ou votre partenaire</div>
          <AddButton onClick={() => openModal()}>
            <FiPlus size={20} /> Ajouter un premier élément
          </AddButton>
        </EmptyState>
      ) : (
        <Grid>
          {items.map(item => (
            <Card key={item._id}>
              <WishlistImage 
                image={getImageUrl(item)}
                onClick={() => setViewingItem(item)}
              >
                <StatusBadge status={item.status}>
                  {getStatusLabel(item.status)}
                </StatusBadge>
              </WishlistImage>
              <WishlistContent>
                <WishlistTitle>{item.title}</WishlistTitle>
                <ForUser>{getForUserLabel(item.for_user)}</ForUser>
                {item.description && <Description>{item.description}</Description>}
                <Actions>
                  <ActionButton
                    className={item.status === 'idea' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'idea')}
                  >
                    Idée
                  </ActionButton>
                  <ActionButton
                    className={item.status === 'bought' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'bought')}
                  >
                    Acheté
                  </ActionButton>
                  <ActionButton
                    className={item.status === 'gifted' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'gifted')}
                  >
                    Offert
                  </ActionButton>
                  {item.link_url && (
                    <ActionButton as="a" href={item.link_url} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink /> Lien
                    </ActionButton>
                  )}
                </Actions>
                <ButtonRow>
                  <EditButton onClick={() => openModal(item)}>
                    <FiEdit2 /> Modifier
                  </EditButton>
                  <DeleteButton onClick={() => remove(item._id)}>
                    <FiTrash2 /> Supprimer
                  </DeleteButton>
                </ButtonRow>
              </WishlistContent>
            </Card>
          ))}
        </Grid>
      )}

      {viewingItem && (
        <ViewModal onClick={(e) => e.target === e.currentTarget && setViewingItem(null)}>
          <ViewContent>
            <ViewImageLarge image={getImageUrl(viewingItem)}>
              <ViewCloseButton onClick={() => setViewingItem(null)}>
                <FiX size={24} />
              </ViewCloseButton>
            </ViewImageLarge>
            <ViewDetails>
              <ViewTitle>{viewingItem.title}</ViewTitle>
              <ViewMeta>
                <ViewBadge type="status" status={viewingItem.status}>
                  {getStatusLabel(viewingItem.status)}
                </ViewBadge>
                <ViewBadge type="recipient">
                  {getForUserLabel(viewingItem.for_user)}
                </ViewBadge>
              </ViewMeta>
              {viewingItem.description && (
                <ViewDescription>{viewingItem.description}</ViewDescription>
              )}
              <ViewActions>
                {viewingItem.link_url && (
                  <ViewActionButton 
                    as="a" 
                    href={viewingItem.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variant="primary"
                  >
                    <FiExternalLink /> Voir le lien
                  </ViewActionButton>
                )}
                <ViewActionButton onClick={() => { setViewingItem(null); openModal(viewingItem); }}>
                  <FiEdit2 /> Modifier
                </ViewActionButton>
                <ViewActionButton onClick={() => { setViewingItem(null); remove(viewingItem._id); }}>
                  <FiTrash2 /> Supprimer
                </ViewActionButton>
              </ViewActions>
            </ViewDetails>
          </ViewContent>
        </ViewModal>
      )}

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editing ? 'Modifier' : 'Ajouter'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>
            <FormGrid>
              <Input
                placeholder="Titre *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <TextArea
                placeholder="Description, détails..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              
              <FileUploadArea>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {imagePreview ? (
                  <ImagePreview>
                    <img src={imagePreview} alt="Preview" />
                    <RemoveImageBtn onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                      <FiX />
                    </RemoveImageBtn>
                  </ImagePreview>
                ) : (
                  <>
                    <FiUpload size={32} style={{ marginBottom: 8, opacity: 0.6 }} />
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      Cliquez pour ajouter une photo
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                      ou collez une URL ci-dessous
                    </div>
                  </>
                )}
              </FileUploadArea>

              <Input
                placeholder="URL de l'image (optionnel)"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
              />
              
              <Input
                placeholder="Lien produit (https://...)"
                value={form.link_url}
                onChange={e => setForm({ ...form, link_url: e.target.value })}
              />
              
              <Select value={form.for_user} onChange={e => setForm({ ...form, for_user: e.target.value })}>
                <option value="">Choisir...</option>
                {currentUserId && <option value={currentUserId}>🎁 Pour {getMyName()}</option>}
                {coupleInfo?.members?.filter(m => m._id !== currentUserId).map(partner => (
                  <option key={partner._id} value={partner._id}>💝 Pour {partner.name}</option>
                ))}
                <option value="both">💑 Pour nous deux</option>
              </Select>
              
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="idea">Idée</option>
                <option value="bought">Acheté</option>
                <option value="gifted">Offert</option>
              </Select>
              
              <SaveButton onClick={save} disabled={!form.title.trim() || uploading}>
                <FiSave size={18} /> {uploading ? 'Upload...' : (editing ? 'Sauvegarder' : 'Ajouter')}
              </SaveButton>
            </FormGrid>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
