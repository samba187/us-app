import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, Calendar, Clock, User, Trash2, Edit } from 'lucide-react'
import { reminderService } from '../services/authService'

const RemindersContainer = styled.div`
  padding: 120px 20px 20px;
  max-width: 800px;
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

const RemindersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const ReminderCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.urgent ? 'var(--error-color)' : 'var(--primary-color)'};
    border-radius: 0 4px 4px 0;
  }
`

const ReminderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 15px;
`

const ReminderContent = styled.div`
  flex: 1;
`

const ReminderTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
`

const ReminderDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
`

const ReminderMeta = styled.div`
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: var(--text-muted);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
  }
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Actions = styled.div`
  display: flex;
  gap: 10px;
`

const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }
  
  &.delete:hover {
    color: var(--error-color);
    background: rgba(239, 68, 68, 0.1);
  }
`

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const ModalContent = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
`

const Input = styled.input`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-family: inherit;
  transition: var(--transition);
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: var(--transition);
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`

const Button = styled(motion.button)`
  padding: 12px 20px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &.primary {
    background: var(--primary-gradient);
    color: white;
  }
  
  &.secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  &:hover {
    transform: translateY(-1px);
  }
`

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
`

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--bg-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--text-muted);
`

function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    urgent: false
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await reminderService.getAll()
      setReminders(response.reminders || [])
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingReminder) {
        await reminderService.update(editingReminder._id, formData)
      } else {
        await reminderService.create(formData)
      }
      fetchReminders()
      closeModal()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
      try {
        await reminderService.delete(id)
        fetchReminders()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const openModal = (reminder = null) => {
    setEditingReminder(reminder)
    setFormData(reminder || {
      title: '',
      description: '',
      date: '',
      time: '',
      urgent: false
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingReminder(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      urgent: false
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <RemindersContainer>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement des rappels...
        </div>
      </RemindersContainer>
    )
  }

  return (
    <RemindersContainer>
      <Header>
        <Title>
          <Bell size={24} />
          Rappels
        </Title>
        <AddButton
          onClick={() => openModal()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Nouveau rappel
        </AddButton>
      </Header>

      {reminders.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <EmptyIcon>
            <Bell size={40} />
          </EmptyIcon>
          <h3>Aucun rappel</h3>
          <p>Créez votre premier rappel pour ne rien oublier !</p>
        </EmptyState>
      ) : (
        <RemindersList>
          <AnimatePresence>
            {reminders.map((reminder, index) => (
              <ReminderCard
                key={reminder._id}
                urgent={reminder.urgent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <ReminderHeader>
                  <ReminderContent>
                    <ReminderTitle>{reminder.title}</ReminderTitle>
                    {reminder.description && (
                      <ReminderDescription>{reminder.description}</ReminderDescription>
                    )}
                    <ReminderMeta>
                      <MetaItem>
                        <Calendar size={14} />
                        {formatDate(reminder.date)}
                      </MetaItem>
                      {reminder.time && (
                        <MetaItem>
                          <Clock size={14} />
                          {reminder.time}
                        </MetaItem>
                      )}
                      <MetaItem>
                        <User size={14} />
                        {reminder.created_by_name || 'Anonyme'}
                      </MetaItem>
                    </ReminderMeta>
                  </ReminderContent>
                  <Actions>
                    <ActionButton
                      onClick={() => openModal(reminder)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      onClick={() => handleDelete(reminder._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </Actions>
                </ReminderHeader>
              </ReminderCard>
            ))}
          </AnimatePresence>
        </RemindersList>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>
                {editingReminder ? 'Modifier le rappel' : 'Nouveau rappel'}
              </ModalTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Titre</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Heure</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.urgent}
                      onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                    />
                    Urgent
                  </Label>
                </FormGroup>
                
                <ButtonGroup>
                  <Button
                    type="button"
                    className="secondary"
                    onClick={closeModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingReminder ? 'Modifier' : 'Créer'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </RemindersContainer>
  )
}

export default Reminders
