import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Heart, Users, Calendar, MapPin, Camera, Star } from 'lucide-react'
import { authService } from '../services/authService'

const HomeContainer = styled.div`
  padding: 120px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const WelcomeSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 40px;
`

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
`

const CoupleStatus = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-md);
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
`

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`

const StatusIcon = styled(motion.div)`
  width: 60px;
  height: 60px;
  background: var(--success-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const StatusText = styled.div`
  text-align: center;
`

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
`

const StatusDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`

const UserCard = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 20px;
  text-align: center;
  border: 1px solid var(--border-color);
`

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0 auto 10px;
`

const UserName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
`

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`

const StatCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 25px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.gradient || 'var(--primary-gradient)'};
  }
`

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.gradient || 'var(--primary-gradient)'};
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 15px;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 5px;
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`

const ActionCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 20px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.gradient || 'var(--primary-gradient)'};
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 10px;
`

const ActionLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
`

function Home({ user }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    reminders: 0,
    restaurants: 0,
    activities: 0,
    photos: 0
  })

  useEffect(() => {
    fetchUsers()
    // Fetch stats from localStorage or API
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await authService.getUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  const fetchStats = () => {
    // Simulate stats - in real app, fetch from API
    setStats({
      reminders: Math.floor(Math.random() * 10) + 1,
      restaurants: Math.floor(Math.random() * 15) + 5,
      activities: Math.floor(Math.random() * 20) + 3,
      photos: Math.floor(Math.random() * 50) + 10
    })
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const quickActions = [
    { icon: Calendar, label: 'Nouveau rappel', gradient: 'var(--primary-gradient)' },
    { icon: MapPin, label: 'Ajouter restaurant', gradient: 'var(--secondary-gradient)' },
    { icon: Camera, label: 'Upload photo', gradient: 'var(--accent-gradient)' },
    { icon: Star, label: 'Nouvelle envie', gradient: 'var(--success-gradient)' }
  ]

  return (
    <HomeContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WelcomeTitle>Bienvenue {user?.name} 💕</WelcomeTitle>
        <WelcomeSubtitle>
          Votre espace couple personnel pour partager vos plus beaux moments
        </WelcomeSubtitle>
      </WelcomeSection>

      <CoupleStatus
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatusHeader>
          <StatusIcon
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart size={30} />
          </StatusIcon>
          <StatusText>
            <StatusTitle>Couple connecté</StatusTitle>
            <StatusDescription>
              {users.length} {users.length > 1 ? 'partenaires' : 'partenaire'} dans votre espace
            </StatusDescription>
          </StatusText>
        </StatusHeader>

        <UsersGrid>
          {users.map((userData, index) => (
            <UserCard
              key={userData._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <UserAvatar>{getInitials(userData.name)}</UserAvatar>
              <UserName>{userData.name}</UserName>
              <UserEmail>{userData.email}</UserEmail>
            </UserCard>
          ))}
        </UsersGrid>
      </CoupleStatus>

      <StatsGrid>
        <StatCard
          gradient="var(--primary-gradient)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon gradient="var(--primary-gradient)">
            <Calendar size={24} />
          </StatIcon>
          <StatValue>{stats.reminders}</StatValue>
          <StatLabel>Rappels actifs</StatLabel>
        </StatCard>

        <StatCard
          gradient="var(--secondary-gradient)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon gradient="var(--secondary-gradient)">
            <MapPin size={24} />
          </StatIcon>
          <StatValue>{stats.restaurants}</StatValue>
          <StatLabel>Restaurants sauvés</StatLabel>
        </StatCard>

        <StatCard
          gradient="var(--accent-gradient)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon gradient="var(--accent-gradient)">
            <Star size={24} />
          </StatIcon>
          <StatValue>{stats.activities}</StatValue>
          <StatLabel>Activités planifiées</StatLabel>
        </StatCard>

        <StatCard
          gradient="var(--success-gradient)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatIcon gradient="var(--success-gradient)">
            <Camera size={24} />
          </StatIcon>
          <StatValue>{stats.photos}</StatValue>
          <StatLabel>Photos partagées</StatLabel>
        </StatCard>
      </StatsGrid>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        Actions rapides
      </motion.h2>

      <QuickActions>
        {quickActions.map((action, index) => (
          <ActionCard
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIcon gradient={action.gradient}>
              <action.icon size={20} />
            </ActionIcon>
            <ActionLabel>{action.label}</ActionLabel>
          </ActionCard>
        ))}
      </QuickActions>
    </HomeContainer>
  )
}

export default Home
