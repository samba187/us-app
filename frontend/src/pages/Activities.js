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
        <AddButton>
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
          </ActivityContent>
        </ActivityCard>
      ))}

      {filteredActivities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          {filter === 'all' ? 'Aucune activité pour le moment' : `Aucune activité ${getStatusLabel(filter).toLowerCase()}`}
        </div>
      )}
    </ActivitiesContainer>
  );
}

export default Activities;
