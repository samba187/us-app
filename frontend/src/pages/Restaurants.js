import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiMapPin, FiStar, FiClock } from 'react-icons/fi';
import { restaurantService } from '../services/authService';

const RestaurantsContainer = styled.div`
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

const FilterTabs = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
`;

const FilterTab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
`;

const RestaurantCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
  overflow: hidden;
`;

const RestaurantImage = styled.div`
  height: 120px;
  background: ${props => props.image ? `url(${props.image})` : 'linear-gradient(135deg, #ff6b8a, #4ecdc4)'};
  background-size: cover;
  background-position: center;
  position: relative;
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
      case 'to_try': return 'rgba(255, 165, 2, 0.9)';
      case 'tried': return 'rgba(46, 213, 115, 0.9)';
      case 'favorite': return 'rgba(255, 107, 138, 0.9)';
      default: return 'rgba(0, 0, 0, 0.7)';
    }
  }};
  color: white;
`;

const RestaurantContent = styled.div`
  padding: 20px;
`;

const RestaurantName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
`;

const RestaurantAddress = styled.p`
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RestaurantNotes = styled.p`
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const RestaurantActions = styled.div`
  display: flex;
  gap: 10px;
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

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    map_url: '',
    image_url: '',
    notes: ''
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    const filterRestaurants = () => {
      let filtered = restaurants;
      
      if (filter !== 'all') {
        filtered = restaurants.filter(r => r.status === filter);
      }
      
      setFilteredRestaurants(filtered);
    };

    filterRestaurants();
  }, [restaurants, filter]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantService.getAll();
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await restaurantService.create(formData);
      setShowModal(false);
      setFormData({ name: '', address: '', map_url: '', image_url: '', notes: '' });
      loadRestaurants();
    } catch (error) {
      console.error('Erreur lors de la création du restaurant:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await restaurantService.update(id, { status: newStatus });
      loadRestaurants();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du restaurant:', error);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'to_try': return 'À tester';
      case 'tried': return 'Testé';
      case 'favorite': return 'Coup de cœur';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'to_try': return <FiClock />;
      case 'tried': return <FiMapPin />;
      case 'favorite': return <FiStar />;
      default: return <FiMapPin />;
    }
  };

  if (loading) {
    return (
      <RestaurantsContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement des restaurants...
        </div>
      </RestaurantsContainer>
    );
  }

  return (
    <RestaurantsContainer className="fade-in">
      <Header>
        <Title>Restaurants</Title>
        <AddButton onClick={() => setShowModal(true)}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <FilterTabs>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          Tous
        </FilterTab>
        <FilterTab active={filter === 'to_try'} onClick={() => setFilter('to_try')}>
          À tester
        </FilterTab>
        <FilterTab active={filter === 'tried'} onClick={() => setFilter('tried')}>
          Testés
        </FilterTab>
        <FilterTab active={filter === 'favorite'} onClick={() => setFilter('favorite')}>
          Favoris
        </FilterTab>
      </FilterTabs>

      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard key={restaurant._id}>
          <RestaurantImage image={restaurant.image_url}>
            <StatusBadge status={restaurant.status}>
              {getStatusIcon(restaurant.status)} {getStatusLabel(restaurant.status)}
            </StatusBadge>
          </RestaurantImage>
          
          <RestaurantContent>
            <RestaurantName>{restaurant.name}</RestaurantName>
            
            {restaurant.address && (
              <RestaurantAddress>
                <FiMapPin /> {restaurant.address}
              </RestaurantAddress>
            )}
            
            {restaurant.notes && (
              <RestaurantNotes>{restaurant.notes}</RestaurantNotes>
            )}
            
            <RestaurantActions>
              <ActionButton
                className={restaurant.status === 'to_try' ? 'active' : ''}
                onClick={() => updateStatus(restaurant._id, 'to_try')}
              >
                À tester
              </ActionButton>
              <ActionButton
                className={restaurant.status === 'tried' ? 'active' : ''}
                onClick={() => updateStatus(restaurant._id, 'tried')}
              >
                Testé
              </ActionButton>
              <ActionButton
                className={restaurant.status === 'favorite' ? 'active' : ''}
                onClick={() => updateStatus(restaurant._id, 'favorite')}
              >
                Favori
              </ActionButton>
            </RestaurantActions>
          </RestaurantContent>
        </RestaurantCard>
      ))}

      {filteredRestaurants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          {filter === 'all' ? 'Aucun restaurant pour le moment' : `Aucun restaurant ${getStatusLabel(filter).toLowerCase()}`}
        </div>
      )}

      <Modal show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Nouveau restaurant</ModalTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Nom du restaurant"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <Input
              type="text"
              placeholder="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            
            <Input
              type="url"
              placeholder="Lien Google Maps (optionnel)"
              value={formData.map_url}
              onChange={(e) => setFormData({...formData, map_url: e.target.value})}
            />
            
            <Input
              type="url"
              placeholder="URL de l'image (optionnel)"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
            
            <TextArea
              placeholder="Notes, avis, plats recommandés..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
            
            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit">
                Ajouter
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>
    </RestaurantsContainer>
  );
}

export default Restaurants;
