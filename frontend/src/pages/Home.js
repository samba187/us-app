import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBell, FiCalendar, FiHeart, FiMapPin } from 'react-icons/fi';
import { reminderService, restaurantService, activityService, wishlistService, authService, coupleService } from '../services/authService';

const HomeContainer = styled.div`
  padding: 20px;
  padding-bottom: 120px; /* Space for navigation */
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Welcome = styled.h1`
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
`;

const DateTime = styled.p`
  color: var(--text-light);
  font-size: 16px;
`;

const CoupleStatus = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 30px;
  text-align: center;
`;

const CoupleInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const UserBadge = styled.div`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const CoupleText = styled.p`
  color: var(--text-light);
  font-size: 14px;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--text-light);
  text-transform: uppercase;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--text-color);
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
`;

const CardDescription = styled.p`
  color: var(--text-light);
  font-size: 14px;
  line-height: 1.4;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.priority) {
      case 'urgent': return '#ff4757';
      case 'important': return '#ffa502';
      default: return '#2ed573';
    }
  }};
  color: white;
  margin-left: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
`;

function Home({ user }) {
  const [stats, setStats] = useState({
    reminders: 0,
    restaurants: 0,
    activities: 0,
    wishlist: 0
  });
  const [recentReminders, setRecentReminders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCoupleStatus();
    loadData();
  }, []);

  const checkCoupleStatus = async () => {
    try {
      const coupleStatus = await coupleService.me();
      if (coupleStatus.status === 'single') {
        window.location.href = '/onboarding-couple';
        return;
      }
    } catch (error) {
      // Si erreur 409, l'intercepteur redirigera automatiquement
      console.log('Couple status check error:', error);
    }
  };

  const loadData = async () => {
    try {
      const [reminders, restaurants, activities, wishlist, coupleUsers] = await Promise.all([
        reminderService.getAll(),
        restaurantService.getAll(),
        activityService.getAll(),
        wishlistService.getAll(),
        authService.getUsers()
      ]);

      setUsers(coupleUsers);

      setStats({
        reminders: reminders.filter(r => r.status === 'pending').length,
        restaurants: restaurants.filter(r => r.status === 'to_try').length,
        activities: activities.filter(a => a.status === 'planned').length,
        wishlist: wishlist.filter(w => w.status === 'idea').length
      });

      // Récents rappels urgents/importants
      setRecentReminders(
        reminders
          .filter(r => r.status === 'pending' && ['urgent', 'important'].includes(r.priority))
          .slice(0, 3)
      );
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    setLoading(false);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <HomeContainer>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          Chargement...
        </div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer className="fade-in">
      <Header>
        <Welcome>Salut {user?.name} ! ❤️</Welcome>
        <DateTime>{getCurrentDateTime()}</DateTime>
      </Header>

      <CoupleStatus>
        <CoupleInfo>
          {users.map((u, index) => (
            <UserBadge key={u.id || u._id}>
              {u.name} {u.id === user?.id || u._id === user?.id ? '(moi)' : ''}
            </UserBadge>
          ))}
          {users.length < 2 && (
            <UserBadge style={{opacity: 0.5}}>
              En attente... 💕
            </UserBadge>
          )}
        </CoupleInfo>
        <CoupleText>
          {users.length === 2 ? (
            `💑 Votre espace couple est complet !`
          ) : (
            `👋 Invitez votre copine à rejoindre l'app !`
          )}
        </CoupleText>
      </CoupleStatus>

      <QuickStats>
        <StatCard>
          <StatIcon color="linear-gradient(135deg, #ff6b8a, #ff8a9b)">
            <FiBell />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.reminders}</StatNumber>
            <StatLabel>Rappels</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #4ecdc4, #44a08d)">
            <FiMapPin />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.restaurants}</StatNumber>
            <StatLabel>Restos à tester</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #45b7d1, #96c93d)">
            <FiCalendar />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.activities}</StatNumber>
            <StatLabel>Activités prévues</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #f093fb, #f5576c)">
            <FiHeart />
          </StatIcon>
          <StatInfo>
            <StatNumber>{stats.wishlist}</StatNumber>
            <StatLabel>Idées cadeaux</StatLabel>
          </StatInfo>
        </StatCard>
      </QuickStats>

      <Section>
        <SectionTitle>Rappels importants</SectionTitle>
        {recentReminders.length > 0 ? (
          recentReminders.map((reminder) => (
            <Card key={reminder._id}>
              <CardTitle>
                {reminder.title}
                <PriorityBadge priority={reminder.priority}>
                  {reminder.priority}
                </PriorityBadge>
              </CardTitle>
              {reminder.description && (
                <CardDescription>{reminder.description}</CardDescription>
              )}
            </Card>
          ))
        ) : (
          <EmptyState>
            <p>Aucun rappel urgent pour le moment ! 😌</p>
          </EmptyState>
        )}
      </Section>
    </HomeContainer>
  );
}

export default Home;
