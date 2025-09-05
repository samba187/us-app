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

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
        <AddButton>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <PhotoGrid>
        {photos.length > 0 ? (
          photos.map((photo) => (
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
    </PhotosContainer>
  );
}

export default Photos;
