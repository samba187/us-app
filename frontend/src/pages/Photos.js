import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCamera, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { photoService } from '../services/authService';

const PhotosContainer = styled.div`
  padding: 20px;
  padding-bottom: 120px;
`;

const Header = styled.div`
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

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const PhotoCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PhotoImage = styled.div`
  height: 150px;
  background: ${props => props.image ? `url(${props.image})` : 'linear-gradient(135deg, #ff6b8a, #4ecdc4)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

const PhotoIcon = styled.div`
  color: white;
  font-size: 24px;
`;

const PhotoCaption = styled.div`
  padding: 15px;
`;

const CaptionText = styled.p`
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.4;
  margin-bottom: 10px;
`;

const PhotoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-light);
`;

const PhotoDate = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PhotoActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-color);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
`;

const ModalClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
`;

const AddModal = styled.div`
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

// eslint-disable-next-line no-unused-vars
const AlbumTabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
  overflow-x: auto;
`;

// eslint-disable-next-line no-unused-vars
const AlbumTab = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  white-space: nowrap;
`;

// eslint-disable-next-line no-unused-vars
const PhotoEditActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

// eslint-disable-next-line no-unused-vars
const PhotoActionBtn = styled.button`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

// eslint-disable-next-line no-unused-vars
const FormSelect = styled.select`
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

const FilterTabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
  overflow-x: auto;
`;

const FilterTab = styled.button`
  flex-shrink: 0;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  white-space: nowrap;
`;

const CreateAlbumButton = styled.button`
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px dashed var(--primary-color);
  border-radius: 8px;
  background: transparent;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
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

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    album_id: '',
    files: null
  });
  const [albums, setAlbums] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState('all');
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  useEffect(() => {
    loadPhotos();
    loadAlbums();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await photoService.getAll();
      setPhotos(data);
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
    }
    setLoading(false);
  };

  const loadAlbums = async () => {
    try {
      const data = await photoService.getAll();
      const albumsSet = new Set();
      data.forEach(photo => {
        if (photo.album_id) albumsSet.add(photo.album_id);
      });
      setAlbums([...albumsSet]);
    } catch (error) {
      console.error('Erreur albums:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.files || formData.files.length === 0) {
      alert('Veuillez sélectionner au moins une photo');
      return;
    }

    try {
      const uploadData = new FormData();
      // Compression séquentielle (peut être parallélisée si besoin)
      for (let file of formData.files) {
        const compressed = await photoService.compressImage(file, { maxWidth: 1600, quality: 0.72 });
        uploadData.append('files', compressed);
      }
      uploadData.append('caption', formData.caption);
      if (formData.album_id) uploadData.append('album_id', formData.album_id);

  await photoService.uploadMultipart(uploadData);
  setShowAddModal(false);
  setFormData({ caption: '', album_id: '', files: null });
  loadPhotos();
  loadAlbums();
    } catch (error) {
      console.error('Erreur upload:', error);
    }
  };

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      setFormData({...formData, album_id: newAlbumName.trim()});
      setShowAlbumModal(false);
      setNewAlbumName('');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeletePhoto = async (id) => {
    if (window.confirm('Supprimer cette photo ?')) {
      try {
        await photoService.delete(id);
        loadPhotos();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredPhotos = currentAlbum === 'all' ? photos : photos.filter(p => p.album_id === currentAlbum);

  if (loading) {
    return (
      <PhotosContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement des photos...
        </div>
      </PhotosContainer>
    );
  }

  return (
    <PhotosContainer className="fade-in">
      <Header>
        <Title>Photos</Title>
        <AddButton onClick={() => setShowAddModal(true)}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <FilterTabs>
        <FilterTab active={currentAlbum === 'all'} onClick={() => setCurrentAlbum('all')}>
          Toutes
        </FilterTab>
        {albums.map(album => (
          <FilterTab 
            key={album} 
            active={currentAlbum === album} 
            onClick={() => setCurrentAlbum(album)}
          >
            📁 {album}
          </FilterTab>
        ))}
        <CreateAlbumButton onClick={() => setShowAlbumModal(true)}>
          + Album
        </CreateAlbumButton>
      </FilterTabs>

      <PhotoGrid>
        {filteredPhotos.length > 0 ? (
          filteredPhotos.map((photo) => (
            <PhotoCard key={photo._id} onClick={() => setSelectedPhoto(photo)}>
              <PhotoImage image={photo.url}>
                <PhotoOverlay>
                  <PhotoIcon>
                    <FiCamera />
                  </PhotoIcon>
                </PhotoOverlay>
              </PhotoImage>
              
              {photo.caption && (
                <PhotoCaption>
                  <CaptionText>{photo.caption}</CaptionText>
                  <PhotoMeta>
                    <PhotoDate>
                      📅 {formatDate(photo.uploaded_at)}
                    </PhotoDate>
                    <PhotoActions>
                      <ActionIcon title="J'aime">
                        <FiHeart />
                      </ActionIcon>
                      <ActionIcon title="Commenter">
                        <FiMessageCircle />
                      </ActionIcon>
                    </PhotoActions>
                  </PhotoMeta>
                </PhotoCaption>
              )}
            </PhotoCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>📸</EmptyIcon>
            <h3>Aucune photo pour le moment</h3>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Commencez à créer vos souvenirs ensemble ! ❤️
            </p>
          </EmptyState>
        )}
      </PhotoGrid>

      <Modal show={selectedPhoto} onClick={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <>
            <ModalClose onClick={() => setSelectedPhoto(null)}>×</ModalClose>
            <ModalImage 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        )}
      </Modal>

      <AddModal show={showAddModal} onClick={() => setShowAddModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Ajouter des photos</ModalTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Légende (optionnel)"
              value={formData.caption}
              onChange={(e) => setFormData({...formData, caption: e.target.value})}
            />
            
            <Select
              value={formData.album_id}
              onChange={(e) => setFormData({...formData, album_id: e.target.value})}
            >
              <option value="">Aucun album</option>
              {albums.map(album => (
                <option key={album} value={album}>{album}</option>
              ))}
            </Select>
            
            <FileInput
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFormData({...formData, files: e.target.files})}
              required
            />
            
            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowAddModal(false)}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit">
                Ajouter
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </AddModal>

      <AddModal show={showAlbumModal} onClick={() => setShowAlbumModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Créer un album</ModalTitle>
          <Input
            type="text"
            placeholder="Nom de l'album"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
          />
          <FormButtons>
            <SecondaryButton type="button" onClick={() => setShowAlbumModal(false)}>
              Annuler
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleCreateAlbum}>
              Créer
            </PrimaryButton>
          </FormButtons>
        </ModalContent>
      </AddModal>
    </PhotosContainer>
  );
}

export default Photos;
