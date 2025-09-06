import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus } from 'react-icons/fi';
import { activityService } from '../services/authService';

const ActivitiesContainer = styled.div`
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
  font-size: 14px;
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
  overflow: hidden;
`;

const ActivityImage = styled.div`
  height: 120px;
  background: ${props => props.image ? `url(${props.image})` : getCategoryGradient(props.category)};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryIcon = styled.div`
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
      case 'planned': return 'rgba(255, 165, 2, 0.9)';
      case 'done': return 'rgba(46, 213, 115, 0.9)';
      case 'wishlist': return 'rgba(255, 107, 138, 0.9)';
      default: return 'rgba(0, 0, 0, 0.7)';
    }
  }};
  color: white;
`;

const ActivityContent = styled.div`
  padding: 20px;
`;

const ActivityTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
`;

const ActivityCategory = styled.p`
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 10px;
  text-transform: capitalize;
`;

const ActivityNotes = styled.p`
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-color);
  font-size: 11px;
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

function getCategoryGradient(category) {
  const gradients = {
    fun: 'linear-gradient(135deg, #ff6b8a, #4ecdc4)',
    romantic: 'linear-gradient(135deg, #f093fb, #f5576c)',
    sport: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    culture: 'linear-gradient(135deg, #fa709a, #fee140)',
    travel: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    other: 'linear-gradient(135deg, #667eea, #764ba2)'
  };
  return gradients[category] || gradients.other;
}

function getCategoryIcon(category) {
  const icons = {
    fun: '🎉',
    romantic: '💕',
    sport: '🏃‍♂️',
    culture: '🎭',
    travel: '✈️',
    other: '📝'
  };
  return icons[category] || icons.other;
}

function Activities() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    notes: '',
    files: null
  });

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    const filterActivities = () => {
      let filtered = activities;
      
      if (filter !== 'all') {
        filtered = activities.filter(a => a.status === filter);
      }
      
      setFilteredActivities(filtered);
    };

    filterActivities();
  }, [activities, filter]);

  const loadActivities = async () => {
    try {
      const data = await activityService.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await activityService.update(id, { status: newStatus });
      loadActivities();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = [];
      
      if (formData.files && formData.files.length > 0) {
        const uploadData = new FormData();
        for (let file of formData.files) {
          uploadData.append('files', file);
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
        }
      }

      const activityData = {
        title: formData.title,
        category: formData.category,
        notes: formData.notes,
        images: imageUrls,
        image_url: imageUrls[0] || ''
      };

      if (editingActivity) {
        await activityService.update(editingActivity._id, activityData);
      } else {
        await activityService.create(activityData);
      }
      
      setShowModal(false);
      setEditingActivity(null);
      setFormData({ title: '', category: 'other', notes: '', files: null });
      loadActivities();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      category: activity.category,
      notes: activity.notes || '',
      files: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette activité ?')) {
      try {
        await activityService.delete(id);
        loadActivities();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planned': return 'Prévue';
      case 'done': return 'Faite';
      case 'wishlist': return 'Idée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ActivitiesContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement des activités...
        </div>
      </ActivitiesContainer>
    );
  }

  return (
    <ActivitiesContainer className="fade-in">
      <Header>
        <Title>Activités</Title>
        <AddButton onClick={() => {
          setEditingActivity(null);
          setFormData({ title: '', category: 'other', notes: '', files: null });
          setShowModal(true);
        }}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <FilterTabs>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          Toutes
        </FilterTab>
        <FilterTab active={filter === 'planned'} onClick={() => setFilter('planned')}>
          Prévues
        </FilterTab>
        <FilterTab active={filter === 'done'} onClick={() => setFilter('done')}>
          Faites
        </FilterTab>
        <FilterTab active={filter === 'wishlist'} onClick={() => setFilter('wishlist')}>
          Idées
        </FilterTab>
      </FilterTabs>

      {filteredActivities.map((activity) => (
        <ActivityCard key={activity._id}>
          <ActivityImage image={activity.image_url} category={activity.category}>
            {!activity.image_url && (
              <CategoryIcon>{getCategoryIcon(activity.category)}</CategoryIcon>
            )}
            <StatusBadge status={activity.status}>
              {getStatusLabel(activity.status)}
            </StatusBadge>
          </ActivityImage>
          
          <ActivityContent>
            <ActivityTitle>{activity.title}</ActivityTitle>
            <ActivityCategory>📂 {activity.category}</ActivityCategory>
            
            {activity.notes && (
              <ActivityNotes>{activity.notes}</ActivityNotes>
            )}
            
            <ActivityActions>
              <ActionButton
                className={activity.status === 'wishlist' ? 'active' : ''}
                onClick={() => updateStatus(activity._id, 'wishlist')}
              >
                Idée
              </ActionButton>
              <ActionButton
                className={activity.status === 'planned' ? 'active' : ''}
                onClick={() => updateStatus(activity._id, 'planned')}
              >
                Prévue
              </ActionButton>
              <ActionButton
                className={activity.status === 'done' ? 'active' : ''}
                onClick={() => updateStatus(activity._id, 'done')}
              >
                Faite
              </ActionButton>
            </ActivityActions>
            
            <EditDeleteRow>
              <EditButton onClick={() => handleEdit(activity)}>
                Modifier
              </EditButton>
              <DeleteButton onClick={() => handleDelete(activity._id)}>
                Supprimer
              </DeleteButton>
            </EditDeleteRow>
          </ActivityContent>
        </ActivityCard>
      ))}

      {filteredActivities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          {filter === 'all' ? 'Aucune activité pour le moment' : `Aucune activité ${getStatusLabel(filter).toLowerCase()}`}
        </div>
      )}

      <Modal show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>{editingActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}</ModalTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Titre de l'activité"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            <Select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="fun">Fun</option>
              <option value="romantic">Romantique</option>
              <option value="sport">Sport</option>
              <option value="culture">Culture</option>
              <option value="travel">Voyage</option>
              <option value="other">Autre</option>
            </Select>
            
            <TextArea
              placeholder="Notes, description..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                {editingActivity ? 'Modifier' : 'Créer'}
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>
    </ActivitiesContainer>
  );
}

export default Activities;
