import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Camera, Plus, Heart } from 'lucide-react'
import { photoService } from '../services/authService'

const Container = styled.div`
  padding: 120px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
`

const AddButton = styled(motion.button)`
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`

const PhotoCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-5px);
  }
`

const PhotoImage = styled.div`
  height: 200px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(transparent, rgba(0,0,0,0.3));
  }
`

const PhotoContent = styled.div`
  padding: 15px;
`

const PhotoCaption = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`

const PhotoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
`

const LikeButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${props => props.liked ? 'var(--error-color)' : 'var(--text-muted)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error-color);
  }
`

function Photos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await photoService.getAll()
      setPhotos(response.photos || [])
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement des photos...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <Camera size={24} />
          Photos
        </Title>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Ajouter une photo
        </AddButton>
      </Header>

      {photos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'var(--bg-muted)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Camera size={40} />
          </div>
          <h3>Aucune photo</h3>
          <p>Commencez votre album photo de couple !</p>
        </motion.div>
      ) : (
        <PhotosGrid>
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <PhotoImage>
                📸
              </PhotoImage>
              <PhotoContent>
                <PhotoCaption>{photo.caption || 'Sans titre'}</PhotoCaption>
                <PhotoMeta>
                  <span>📅 {formatDate(photo.created_at)}</span>
                  <LikeButton
                    liked={photo.liked}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart size={14} fill={photo.liked ? 'currentColor' : 'none'} />
                    {photo.likes || 0}
                  </LikeButton>
                </PhotoMeta>
              </PhotoContent>
            </PhotoCard>
          ))}
        </PhotosGrid>
      )}
    </Container>
  )
}

export default Photos
