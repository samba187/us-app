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

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    map_url: '',
    notes: '',
    files: null
  });
  const [detailRestaurant, setDetailRestaurant] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailIndex, setDetailIndex] = useState(0);

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
      let imageUrls = [];
      
      if (formData.files && formData.files.length > 0) {
        const uploadData = new FormData();
        for (let file of formData.files) {
          try {
            // Lazy import local util via photoService for consistency
            const { photoService } = await import('../services/authService');
            const compressed = await photoService.compressImage(file, { maxWidth: 1400, quality: 0.7 });
            uploadData.append('files', compressed);
          } catch (e) {
            uploadData.append('files', file);
          }
        }
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('us_token')}`
          },
          body: uploadData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.files || [];
          console.debug('Upload restaurants result', uploadResult);
        }
      }

      const restaurantData = {
        name: formData.name,
        address: formData.address,
        map_url: formData.map_url,
        notes: formData.notes,
        images: imageUrls.length ? imageUrls : (editingRestaurant?.images || []),
        image_url: (imageUrls[0]) || (editingRestaurant?.image_url || '')
      };

      if (editingRestaurant) {
        await restaurantService.update(editingRestaurant._id, restaurantData);
      } else {
        await restaurantService.create(restaurantData);
      }
      
      setShowModal(false);
      setEditingRestaurant(null);
      setFormData({ name: '', address: '', map_url: '', notes: '', files: null });
      loadRestaurants();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.address || '',
      map_url: restaurant.map_url || '',
      notes: restaurant.notes || '',
      files: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce restaurant ?')) {
      try {
        await restaurantService.delete(id);
        loadRestaurants();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
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
        <AddButton onClick={() => {
          setEditingRestaurant(null);
          setFormData({ name: '', address: '', map_url: '', notes: '', files: null });
          setShowModal(true);
        }}>
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
        <RestaurantCard key={restaurant._id} onClick={() => { setDetailRestaurant(restaurant); setDetailIndex(0); setShowDetail(true); }}>
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
            
            <EditDeleteRow onClick={(e) => e.stopPropagation()}>
              <EditButton onClick={() => handleEdit(restaurant)}>
                Modifier
              </EditButton>
              <DeleteButton onClick={() => handleDelete(restaurant._id)}>
                Supprimer
              </DeleteButton>
            </EditDeleteRow>
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
          <ModalTitle>{editingRestaurant ? 'Modifier le restaurant' : 'Nouveau restaurant'}</ModalTitle>
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
            
            <FileInput
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFormData({...formData, files: e.target.files})}
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
                {editingRestaurant ? 'Modifier' : 'Ajouter'}
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>

      {/* Détail Restaurant */}
      <Modal show={showDetail} onClick={() => setShowDetail(false)}>
        {detailRestaurant && (
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{detailRestaurant.name}</ModalTitle>
            {detailRestaurant.images && detailRestaurant.images.length > 0 ? (
              <div style={{marginBottom:'15px'}}>
                <div style={{position:'relative', borderRadius:'12px', overflow:'hidden', boxShadow:'var(--shadow)'}}>
                  <img src={detailRestaurant.images[detailIndex]} alt="resto" style={{width:'100%', display:'block'}} />
                  {detailRestaurant.images.length > 1 && (
                    <div style={{position:'absolute', top:8, right:8, display:'flex', gap:4}}>
                      <button style={{background:'rgba(0,0,0,0.5)', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6, cursor:'pointer'}} onClick={() => setDetailIndex((detailIndex - 1 + detailRestaurant.images.length)%detailRestaurant.images.length)}>‹</button>
                      <button style={{background:'rgba(0,0,0,0.5)', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6, cursor:'pointer'}} onClick={() => setDetailIndex((detailIndex + 1)%detailRestaurant.images.length)}>›</button>
                    </div>
                  )}
                </div>
                <div style={{textAlign:'center', marginTop:8, fontSize:12, color:'var(--text-light)'}}>
                  {detailIndex+1} / {detailRestaurant.images.length}
                </div>
                <div style={{display:'flex', gap:6, marginTop:10, overflowX:'auto'}}>
                  {detailRestaurant.images.map((img,i)=>(
                    <img key={i} src={img} alt={'mini'} onClick={()=>setDetailIndex(i)} style={{height:50, borderRadius:6, cursor:'pointer', outline: i===detailIndex?'2px solid #ff6b8a':'none'}} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{margin:'10px 0', fontSize:14, color:'var(--text-light)'}}>Aucune image</div>
            )}
            {detailRestaurant.address && <p style={{fontSize:14, margin:'4px 0'}}>📍 {detailRestaurant.address}</p>}
            {detailRestaurant.map_url && <p style={{fontSize:14, margin:'4px 0'}}><a href={detailRestaurant.map_url} target="_blank" rel="noreferrer">Ouvrir la carte</a></p>}
            {detailRestaurant.notes && <p style={{whiteSpace:'pre-line', fontSize:14, marginTop:10}}>{detailRestaurant.notes}</p>}
            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowDetail(false)}>Fermer</SecondaryButton>
              <PrimaryButton type="button" onClick={() => { setShowDetail(false); handleEdit(detailRestaurant); }}>Éditer</PrimaryButton>
            </FormButtons>
          </ModalContent>
        )}
      </Modal>
    </RestaurantsContainer>
  );
}

export default Restaurants;
