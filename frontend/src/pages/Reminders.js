import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import { reminderService } from '../services/authService';
import notificationService from '../services/notificationService';
import NotificationSettings from '../components/NotificationSettings';

const RemindersContainer = styled.div`
  padding: 20px;
  padding-bottom: 120px;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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
`;

const ReminderCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'urgent': return '#ff4757';
      case 'important': return '#ffa502';
      default: return '#2ed573';
    }
  }};
`;

const ReminderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const ReminderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  flex: 1;
`;

const CompleteButton = styled.button`
  background: ${props => props.completed ? '#2ed573' : 'var(--border-color)'};
  color: ${props => props.completed ? 'white' : 'var(--text-color)'};
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReminderDescription = styled.p`
  color: var(--text-light);
  margin-bottom: 15px;
  line-height: 1.4;
`;

const ReminderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: var(--text-light);
`;

const PriorityBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.priority) {
      case 'urgent': return 'rgba(255, 71, 87, 0.1)';
      case 'important': return 'rgba(255, 165, 2, 0.1)';
      default: return 'rgba(46, 213, 115, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'urgent': return '#ff4757';
      case 'important': return '#ffa502';
      default: return '#2ed573';
    }
  }};
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
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
`;

const EditButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  background: #ff6b8a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    due_date: ''
  });

  useEffect(() => {
    loadReminders();
    // Initialiser les notifications
    initNotifications();
  }, []);

  const initNotifications = async () => {
    try {
      await notificationService.init();
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    }
  };

  useEffect(() => {
    const filterReminders = () => {
      let filtered = reminders;
      
      switch (filter) {
        case 'pending':
          filtered = reminders.filter(r => r.status === 'pending');
          break;
        case 'urgent':
          filtered = reminders.filter(r => r.priority === 'urgent' && r.status === 'pending');
          break;
        case 'completed':
          filtered = reminders.filter(r => r.status === 'done');
          break;
        default:
          break;
      }
      
      setFilteredReminders(filtered);
    };

    filterReminders();
    
    // Programmer les notifications pour les échéances
    const notificationSettings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
    if (notificationSettings.dueDateReminders !== false) {
      notificationService.scheduleReminderNotifications(reminders);
    }
  }, [reminders, filter]);

  const loadReminders = async () => {
    try {
      const data = await reminderService.getAll();
      setReminders(data);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let reminder;
      if (editingReminder) {
        await reminderService.update(editingReminder._id, formData);
        reminder = { ...editingReminder, ...formData };
      } else {
        const result = await reminderService.create(formData);
        reminder = result;
        
        // Notification pour nouveau rappel
        const notificationSettings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        if (notificationSettings.newReminders !== false) {
          await notificationService.notifyNewReminder(reminder);
          
          // Notification spéciale pour rappels urgents
          if (reminder.priority === 'urgent' && notificationSettings.urgentReminders !== false) {
            setTimeout(() => {
              notificationService.notifyUrgentReminder(reminder);
            }, 1000);
          }
        }
      }
      
      setShowModal(false);
      setEditingReminder(null);
      setFormData({ title: '', description: '', priority: 'normal', due_date: '' });
      loadReminders();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rappel:', error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
      await reminderService.update(id, { status: newStatus });
      loadReminders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rappel:', error);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      priority: reminder.priority,
      due_date: reminder.due_date ? reminder.due_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce rappel ?')) {
      try {
        await reminderService.delete(id);
        loadReminders();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <FiAlertCircle />;
      case 'important': return <FiClock />;
      default: return <FiCheck />;
    }
  };

  if (loading) {
    return (
      <RemindersContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement des rappels...
        </div>
      </RemindersContainer>
    );
  }

  return (
    <RemindersContainer className="fade-in">
      <Header>
        <Title>Rappels</Title>
        <AddButton onClick={() => setShowModal(true)}>
          <FiPlus /> Ajouter
        </AddButton>
      </Header>

      <NotificationSettings />

      <FilterTabs>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          Tous
        </FilterTab>
        <FilterTab active={filter === 'pending'} onClick={() => setFilter('pending')}>
          En cours
        </FilterTab>
        <FilterTab active={filter === 'urgent'} onClick={() => setFilter('urgent')}>
          Urgents
        </FilterTab>
        <FilterTab active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Terminés
        </FilterTab>
      </FilterTabs>

      {filteredReminders.map((reminder) => (
        <ReminderCard key={reminder._id} priority={reminder.priority}>
          <ReminderHeader>
            <ReminderTitle>{reminder.title}</ReminderTitle>
            <CompleteButton
              completed={reminder.status === 'done'}
              onClick={() => toggleComplete(reminder._id, reminder.status)}
            >
              <FiCheck />
            </CompleteButton>
          </ReminderHeader>
          
          {reminder.description && (
            <ReminderDescription>{reminder.description}</ReminderDescription>
          )}
          
          <ReminderMeta>
            <PriorityBadge priority={reminder.priority}>
              {getPriorityIcon(reminder.priority)}
              {reminder.priority}
            </PriorityBadge>
            
            {reminder.due_date && (
              <span>📅 {new Date(reminder.due_date).toLocaleDateString('fr-FR')}</span>
            )}
          </ReminderMeta>
          
          <EditDeleteRow>
            <EditButton onClick={() => handleEdit(reminder)}>
              Modifier
            </EditButton>
            <DeleteButton onClick={() => handleDelete(reminder._id)}>
              Supprimer
            </DeleteButton>
          </EditDeleteRow>
        </ReminderCard>
      ))}

      {filteredReminders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          {filter === 'all' ? 'Aucun rappel pour le moment' : `Aucun rappel ${filter === 'pending' ? 'en cours' : filter === 'urgent' ? 'urgent' : 'terminé'}`}
        </div>
      )}

      <Modal show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Nouveau rappel</ModalTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Titre du rappel"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            <TextArea
              placeholder="Description (optionnel)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </Select>
            
            <Input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            />
            
            <FormButtons>
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                Annuler
              </SecondaryButton>
              <PrimaryButton type="submit">
                Créer
              </PrimaryButton>
            </FormButtons>
          </Form>
        </ModalContent>
      </Modal>
    </RemindersContainer>
  );
}

export default Reminders;
