import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiExternalLink } from 'react-icons/fi';
import { authService } from '../services/authService';

const Container = styled.div`
  padding: 15px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-color);
  font-size: 24px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
  }
`;

const AddButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  min-height: 50px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 18px 25px;
    font-size: 18px;
    border-radius: 12px;
    min-height: 56px;
  }
`;

const WishlistCard = styled.div`
  background: white;
  border-radius: 18px;
  box-shadow: var(--shadow);
  margin-bottom: 18px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: box-shadow .25s, transform .25s;
  &.expanded {
    box-shadow: 0 10px 28px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
`;

const WishlistImage = styled.div`
  height: 140px;
  background: ${({ image }) => {
    if (image) {
      const p = image.startsWith('http') ? image : (image.startsWith('/') ? image : `/${image}`);
      return `url(${p})`;
    }
    return 'linear-gradient(135deg,#ddd,#bbb)';
  }};
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
`;

const WishlistContent = styled.div`
  padding: 18px 20px 20px;
`;

const WishlistTitle = styled.h3`
  margin: 0 0 8px 0;
  color: var(--text-color);
  font-size: 18px;
`;

const ForUser = styled.p`
  color: var(--primary-color);
  font-size: 14px;
  margin: 0 0 12px 0;
  font-weight: 500;
`;

const WishlistDescription = styled.p`
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 14px;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: ${props => {
    switch(props.status) {
      case 'idea': return '#3498db';
      case 'bought': return '#e74c3c';
      case 'gifted': return '#27ae60';
      default: return '#95a5a6';
    }
  }};
`;

const ToggleDetails = styled.button`
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 6px 10px;
  font-size: 11px;
  border: none;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border-radius: 14px;
  cursor: pointer;
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GalleryBadge = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 6px 10px;
  font-size: 11px;
  border: none;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WishlistActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  &:hover {
    border-color: var(--primary-color);
  }
`;

const LinkButton = styled.a`
  padding: 8px 16px;
  border: 2px solid var(--primary-color);
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const EditDeleteRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const EditButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f8f9fa;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid #e74c3c;
  background: white;
  color: #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #e74c3c;
    color: white;
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
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
    max-height: 85vh;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  color: var(--text-color);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  min-height: 48px;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: var(--border-color);
    color: var(--text-color);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 15px;
    font-size: 16px;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PreviewImage = styled.div`
  width: 80px;
  height: 80px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageGallery = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const GalleryImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
`;

const GalleryControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
`;

const GalleryButton = styled.button`
  padding: 10px 20px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
`;

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingImages, setViewingImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState({}); // id -> bool
  const [couples, setCouples] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    recipient_id: '',
    status: 'idea'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    loadWishlist();
    loadCouples();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await authService.api.get('/api/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCouples = async () => {
    try {
      console.log('Loading couples...');
      const response = await authService.api.get('/api/couples');
      console.log('Couples loaded:', response.data);
      setCouples(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des couples:', error);
      // Pas de couples = pas grave, on peut quand même utiliser "Moi"
      setCouples([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }
    
    try {
      let uploadedImages = [];
      
      if (imageFiles.length > 0) {
        console.log('Uploading images:', imageFiles.length);
        const uploadPromises = imageFiles.map(file => 
          authService.photoService.uploadMultipart([file])
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImages = uploadResults.flat();
        console.log('Images uploaded:', uploadedImages);
      }

      const wishlistData = {
        title: formData.title,
        description: formData.description,
        link_url: formData.link_url,
        recipient_id: formData.recipient_id,
        status: formData.status,
        images: uploadedImages.map(img => img._id)
      };
      
      console.log('Sending wishlist data:', wishlistData);

      if (editingItem) {
        await authService.api.put(`/api/wishlist/${editingItem._id}`, wishlistData);
      } else {
        await authService.api.post('/api/wishlist', wishlistData);
      }
      
      console.log('Wishlist item saved successfully');
      await loadWishlist();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      link_url: '',
      recipient_id: '',
      status: 'idea'
    });
    setSelectedImages([]);
    setImageFiles([]);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      link_url: item.link_url || '',
      recipient_id: item.recipient_id || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await authService.api.delete(`/api/wishlist/${id}`);
        await loadWishlist();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await authService.api.put(`/api/wishlist/${id}`, { status });
      await loadWishlist();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'idea': return 'Idée';
      case 'bought': return 'Acheté';
      case 'gifted': return 'Offert';
      default: return 'Idée';
    }
  };

  const getUserName = (item) => {
    if (!item.recipient_id) return 'Moi';
    const couple = couples.find(c => c._id === item.recipient_id);
    return couple ? couple.name : 'Inconnu';
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `/uploads/${image}`;
    }
    return image?.filename ? `/uploads/${image.filename}` : null;
  };

  if (loading) {
    return <Container>Chargement...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Wishlist</Title>
        <AddButton onClick={() => setShowModal(true)}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      {wishlist.map((item) => {
        const isExpanded = !!expanded[item._id];
        const cover = item.image_url || (item.images && item.images[0] && getImageUrl(item.images[0]));
        return (
          <WishlistCard key={item._id} className={isExpanded ? 'expanded' : ''}>
            <WishlistImage
              image={cover}
              onClick={() => setExpanded(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
            >
              <StatusBadge status={item.status}>{getStatusLabel(item.status)}</StatusBadge>
              {item.images && item.images.length > 1 && (
                <GalleryBadge
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(0);
                    setViewingImages(item);
                  }}
                >📷 {item.images.length}</GalleryBadge>
              )}
              {!cover && <ToggleDetails onClick={(e)=>{e.stopPropagation();setExpanded(p=>({...p,[item._id]:!p[item._id]}));}}>Détails</ToggleDetails>}
            </WishlistImage>
            {isExpanded && (
              <WishlistContent>
                <WishlistTitle>{item.title}</WishlistTitle>
                <ForUser>Pour {getUserName(item)}</ForUser>
                {item.description && (
                  <WishlistDescription>{item.description}</WishlistDescription>
                )}
                <WishlistActions>
                  <ActionButton
                    className={item.status === 'idea' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'idea')}
                  >Idée</ActionButton>
                  <ActionButton
                    className={item.status === 'bought' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'bought')}
                  >Acheté</ActionButton>
                  <ActionButton
                    className={item.status === 'gifted' ? 'active' : ''}
                    onClick={() => updateStatus(item._id, 'gifted')}
                  >Offert</ActionButton>
                  {item.link_url && (
                    <LinkButton href={item.link_url} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink /> Voir
                    </LinkButton>
                  )}
                </WishlistActions>
                <EditDeleteRow>
                  <EditButton onClick={() => handleEdit(item)}>Modifier</EditButton>
                  <DeleteButton onClick={() => handleDelete(item._id)}>Supprimer</DeleteButton>
                </EditDeleteRow>
              </WishlistContent>
            )}
          </WishlistCard>
        );
      })}

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            <ModalTitle>{editingItem ? 'Modifier' : 'Ajouter'} un élément</ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Titre *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de l'élément..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Lien URL</Label>
                <Input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                  placeholder="https://..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Pour qui ?</Label>
                <Select
                  value={formData.recipient_id}
                  onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
                >
                  <option value="">Moi</option>
                  {couples.map(couple => (
                    <option key={couple._id} value={couple._id}>{couple.name}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="idea">Idée</option>
                  <option value="bought">Acheté</option>
                  <option value="gifted">Offert</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Images</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {selectedImages.length > 0 && (
                  <ImagePreview>
                    {selectedImages.map((src, index) => (
                      <PreviewImage key={index} src={src}>
                        <RemoveImageButton onClick={() => removeImage(index)}>
                          ×
                        </RemoveImageButton>
                      </PreviewImage>
                    ))}
                  </ImagePreview>
                )}
              </FormGroup>

              <ModalActions>
                <ModalButton type="button" className="secondary" onClick={handleCloseModal}>
                  Annuler
                </ModalButton>
                <ModalButton type="submit" className="primary" disabled={!formData.title.trim()}>
                  {editingItem ? 'Modifier' : 'Ajouter'}
                </ModalButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {viewingImages && (
        <ImageGallery onClick={() => setViewingImages(null)}>
          <CloseButton onClick={() => setViewingImages(null)}>×</CloseButton>
          <GalleryImage 
            src={getImageUrl(viewingImages.images[currentImageIndex])}
            alt="Wishlist item"
          />
          {viewingImages.images.length > 1 && (
            <GalleryControls>
              <GalleryButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => 
                    prev > 0 ? prev - 1 : viewingImages.images.length - 1
                  );
                }}
              >
                Précédent
              </GalleryButton>
              <GalleryButton 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => 
                    prev < viewingImages.images.length - 1 ? prev + 1 : 0
                  );
                }}
              >
                Suivant
              </GalleryButton>
            </GalleryControls>
          )}
        </ImageGallery>
      )}
    </Container>
  );
}

export default Wishlist;
