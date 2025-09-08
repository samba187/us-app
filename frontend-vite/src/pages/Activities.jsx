import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Calendar, Plus } from 'lucide-react'
import { activityService } from '../services/authService'

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
  background: var(--accent-gradient);
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

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const ActivityCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent-color);
`

const ActivityTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
`

const ActivityDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
`

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
`

function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await activityService.getAll()
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          Chargement des activités...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <Calendar size={24} />
          Activités
        </Title>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Nouvelle activité
        </AddButton>
      </Header>

      {activities.length === 0 ? (
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
            <Calendar size={40} />
          </div>
          <h3>Aucune activité</h3>
          <p>Planifiez votre première sortie ensemble !</p>
        </motion.div>
      ) : (
        <ActivitiesList>
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ActivityTitle>{activity.title}</ActivityTitle>
              {activity.description && (
                <ActivityDescription>{activity.description}</ActivityDescription>
              )}
              <ActivityMeta>
                <span>📅 {new Date(activity.date).toLocaleDateString('fr-FR')}</span>
                <span>👤 {activity.created_by_name || 'Anonyme'}</span>
              </ActivityMeta>
            </ActivityCard>
          ))}
        </ActivitiesList>
      )}
    </Container>
  )
}

export default Activities
