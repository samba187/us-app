import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiHeart, FiExternalLink } from 'react-icons/fi';
import { wishlistService, photoService } from '../services/authService';
import crossNotificationService from '../services/crossNotificationService';

const WishlistContainer = styled.div`
  padding: 20px;
  padding-bottom: 120px;
`    setFormData({
      title: item.title || '',
      description: item.description || '',
      link_url: item.link_url || '',
      files: null
    });nst Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WishlistCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
  overflow: hidden;
`;

const WishlistImage = styled.div`
  height: 120px;
  background: ${props => {
    if (props.image) {
      // Gérer les différents formats de chemin d'image
      const imagePath = props.image.startsWith('http') 
        ? props.image 
        : props.image.startsWith('/') 
          ? props.image 
          : `/${props.image}`;
      return `url(${imagePath})`;
    }
    return 'linear-gradient(135deg, #f093fb, #f5576c)';
  }};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WishlistIcon = styled.div`
  font-size: 48px;
  color: white;
  opacity: 0.8;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'idea': return 'rgba(255, 165, 2, 0.9)';
      case 'bought': return 'rgba(46, 213, 115, 0.9)';
      case 'gifted': return 'rgba(255, 107, 138, 0.9)';
      default: return 'rgba(0, 0, 0, 0.7)';
    }
  }};
  color: white;
`;

const WishlistContent = styled.div`
  padding: 20px;
`;

const WishlistTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
`;

const ForUser = styled.p`
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
`;

const WishlistDescription = styled.p`
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const WishlistActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-color);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--background-color);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
`;

const LinkButton = styled.a`
  padding: 8px 12px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background: white;
  color: var(--primary-color);
  font-size: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const EditDeleteRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const EditButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #4ecdc4;
  border-radius: 6px;
  background: white;
  color: #4ecdc4;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #4ecdc4;
    color: white;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ff6b8a;
  border-radius: 6px;
  background: white;
  color: #ff6b8a;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #ff6b8a;
    color: white;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin-bottom: 20px;
  color: var(--text-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FileInput = styled.input`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: var(--border-color);
  color: var(--text-color);
`;

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    files: null
  });

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getAll();
      setWishlist(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await wishlistService.update(id, { status: newStatus });
      loadWishlist();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'item:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      // Upload de l'image si présente
      if (formData.files && formData.files.length > 0) {
        const uploadData = new FormData();
        uploadData.append('files', formData.files[0]); // Prendre la première image
        uploadData.append('category', 'wishlist');
        
        try {
          const uploadResult = await photoService.uploadMultipart(uploadData);
          if (uploadResult && uploadResult.length > 0) {
            imageUrl = uploadResult[0].path; // Utiliser le path de l'image uploadée
          }
        } catch (uploadError) {
          console.error('Erreur upload image:', uploadError);
        }
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        link_url: formData.link_url,
        image_url: imageUrl || editingItem?.image_url || ''
      };

      if (editingItem) {
        await wishlistService.update(editingItem._id, itemData);
      } else {
        const newItem = await wishlistService.create(itemData);
        
        // Déclencher les notifications croisées
        setTimeout(() => {
          crossNotificationService.triggerImmediateCheck();
        }, 1000);
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', link_url: '', files: null });
      loadWishlist();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      link_url: item.link_url || '',
      for_user: item.for_user || 'user1',
      files: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet élément ?')) {
      try {
        await wishlistService.delete(id);
        loadWishlist();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
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

  const getUserName = (item) => {
    const currentUser = JSON.parse(localStorage.getItem('us_user') || '{}');
    
    // Si l'item a été créé par l'utilisateur actuel
    if (item.created_by === currentUser._id) {
      return 'Toi';
    } else {
      // Si l'item a été créé par le/la partenaire  
      return 'Ton/ta partenaire';
    }
  };

  if (loading) {
    return (
      <WishlistContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement de la wishlist...
        </div>
      </WishlistContainer>
    );
  }

  return (
    <WishlistContainer className="fade-in">
      <Header>
        <Title>Wishlist</Title>
        <AddButton onClick={() => {
          setEditingItem(null);
          setFormData({ title: '', description: '', link_url: '', files: null });
          setShowModal(true);
        }}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      {wishlist.map((item) => (
        <WishlistCard key={item._id}>
          <WishlistImage image={item.image_url}>
            {!item.image_url && (
              <WishlistIcon>🎁</WishlistIcon>
            )}
            <StatusBadge status={item.status}>
              {getStatusLabel(item.status)}
            </StatusBadge>
          </WishlistImage>
          
          <WishlistContent>
            <WishlistTitle>{item.title}</WishlistTitle>
            <ForUser>💝 Pour {getUserName(item)}</ForUser>
            
            {item.description && (
              <WishlistDescription>{item.description}</WishlistDescription>
            )}
            
            <WishlistActions>
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
                <LinkButton href={item.link_url} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink /> Voir
                </LinkButton>
              )}
            </WishlistActions>
            
            <EditDeleteRow>
              <EditButton onClick={() => handleEdit(item)}>
                Modifier
              </EditButton>
              <DeleteButton onClick={() => handleDelete(item._id)}>
                Supprimer
              </DeleteButton>
            </EditDeleteRow>
          </WishlistContent>
        </WishlistCard>
      ))}

      {wishlist.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          <FiHeart size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
          <p>Aucune idée cadeau pour le moment</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Ajoutez vos envies et idées cadeaux ! 🎁
          </p>
        </div>
      )}

      <Modal show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>{editingItem ? 'Modifier l\'élément' : 'Nouveau souhait'}</ModalTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Titre"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            <TextArea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            
            <Input
              type="url"
              placeholder="Lien (optionnel)"
              value={formData.link_url}
              onChange={(e) => setFormData({...formData, link_url: e.target.value})}
            />
            
            <FileInput
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFormData({...formData, files: e.target.files})}
            />
            
            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit">
                {editingItem ? 'Modifier' : 'Créer'}
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>
    </WishlistContainer>
  );
}

export default Wishlist;
