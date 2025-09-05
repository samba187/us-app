import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { wishlistService } from '../services/authService'

const Container = styled.div`
  padding: 120px 20px 20px;
  max-width: 1000px;
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
  background: var(--success-gradient);
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

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`

const WishCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--success-gradient);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }
`

const WishTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`

const WishDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
`

const WishMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 15px;
`

const Priority = styled.span`
  background: ${props => {
    switch(props.level) {
      case 'high': return 'var(--error-color)';
      case 'medium': return 'var(--warning-color)';
      default: return 'var(--success-color)';
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`

function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getAll()
      setWishlist(response.wishlist || [])
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      default: return 'Faible';
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement de la wishlist...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <Heart size={24} />
          Wishlist
        </Title>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Nouvelle envie
        </AddButton>
      </Header>

      {wishlist.length === 0 ? (
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
            <Heart size={40} />
          </div>
          <h3>Aucune envie</h3>
          <p>Ajoutez vos rêves et projets de couple !</p>
        </motion.div>
      ) : (
        <WishlistGrid>
          {wishlist.map((item, index) => (
            <WishCard
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <WishTitle>{item.title}</WishTitle>
              {item.description && (
                <WishDescription>{item.description}</WishDescription>
              )}
              <WishMeta>
                <Priority level={item.priority}>
                  {getPriorityText(item.priority)}
                </Priority>
                <span>👤 {item.created_by_name || 'Anonyme'}</span>
              </WishMeta>
            </WishCard>
          ))}
        </WishlistGrid>
      )}
    </Container>
  )
}

export default Wishlist
