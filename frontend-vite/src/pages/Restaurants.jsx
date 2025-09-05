import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { MapPin, Plus, Star, Clock, User } from 'lucide-react'
import { restaurantService } from '../services/authService'

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
  background: var(--secondary-gradient);
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

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`

const RestaurantCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`

const RestaurantImage = styled.div`
  height: 200px;
  background: var(--secondary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
`

const RestaurantContent = styled.div`
  padding: 20px;
`

const RestaurantName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`

const RestaurantAddress = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
`

const RestaurantMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 15px;
`

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--warning-color);
`

const CreatedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantService.getAll()
      setRestaurants(response.restaurants || [])
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement des restaurants...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <MapPin size={24} />
          Restaurants
        </Title>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Ajouter un restaurant
        </AddButton>
      </Header>

      {restaurants.length === 0 ? (
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
            <MapPin size={40} />
          </div>
          <h3>Aucun restaurant</h3>
          <p>Ajoutez vos restaurants préférés !</p>
        </motion.div>
      ) : (
        <RestaurantGrid>
          {restaurants.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <RestaurantImage>
                🍽️
              </RestaurantImage>
              <RestaurantContent>
                <RestaurantName>{restaurant.name}</RestaurantName>
                <RestaurantAddress>{restaurant.address}</RestaurantAddress>
                {restaurant.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {restaurant.description}
                  </p>
                )}
                <RestaurantMeta>
                  <Rating>
                    <Star size={14} fill="currentColor" />
                    {restaurant.rating || 'N/A'}
                  </Rating>
                  <CreatedBy>
                    <User size={14} />
                    {restaurant.created_by_name || 'Anonyme'}
                  </CreatedBy>
                </RestaurantMeta>
              </RestaurantContent>
            </RestaurantCard>
          ))}
        </RestaurantGrid>
      )}
    </Container>
  )
}

export default Restaurants
