import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiHeart, FiBell, FiCamera, FiList, FiTrendingUp, FiActivity } from 'react-icons/fi';
import NotificationSettings from '../components/NotificationSettings';
import PWAGuide from '../components/PWAGuide';

const Container = styled.div`
  padding: 20px 16px;
  max-width: 900px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 16px 12px; }
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  @media (max-width: 768px) { font-size: 28px; }
`;

const Subtitle = styled.p`
  color: var(--muted-text);
  font-size: 15px;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.3), 0 8px 20px rgba(0,0,0,0.15); }
  50% { box-shadow: 0 0 30px rgba(124,58,237,0.5), 0 10px 28px rgba(0,0,0,0.2); }
`;

const CardLink = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  @supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
    backdrop-filter: saturate(150%) blur(12px);
    -webkit-backdrop-filter: saturate(150%) blur(12px);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 18px;
    padding: 1px;
    background: linear-gradient(135deg, var(--neon-1), var(--neon-2), var(--neon-3));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(124,58,237,0.5);
    animation: ${pulse} 2s infinite;
  }

  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.gradient || 'linear-gradient(135deg, var(--neon-1), var(--neon-3))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  box-shadow: 0 6px 18px rgba(124,58,237,0.35);
  transition: transform 0.3s ease;

  ${CardLink}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.3px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  @supports (backdrop-filter: blur(8px)) {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.bg || 'rgba(124,58,237,0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || 'var(--neon-1)'};
  font-size: 20px;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--muted-text);
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

export default function Home({ navigate }) {
  return (
    <Container>
      <Hero>
        <Title>Bienvenue dans US</Title>
        <Subtitle>Gérez vos souvenirs et projets de couple</Subtitle>
      </Hero>

      <StatsGrid>
        <StatCard>
          <StatIcon bg="rgba(124,58,237,0.15)" color="var(--neon-1)">
            <FiTrendingUp />
          </StatIcon>
          <StatContent>
            <StatLabel>Cette semaine</StatLabel>
            <StatValue>12</StatValue>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bg="rgba(34,211,238,0.15)" color="var(--neon-2)">
            <FiActivity />
          </StatIcon>
          <StatContent>
            <StatLabel>Activités</StatLabel>
            <StatValue>5</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <Grid>
        <CardLink onClick={() => navigate('/wishlist')}>
          <IconWrapper gradient="linear-gradient(135deg, #7c3aed, #ec4899)">
            <FiHeart />
          </IconWrapper>
          <CardTitle>Wishlist</CardTitle>
        </CardLink>

        <CardLink onClick={() => navigate('/reminders')}>
          <IconWrapper gradient="linear-gradient(135deg, #22d3ee, #06b6d4)">
            <FiBell />
          </IconWrapper>
          <CardTitle>Rappels</CardTitle>
        </CardLink>

        <CardLink onClick={() => navigate('/photos')}>
          <IconWrapper gradient="linear-gradient(135deg, #f59e0b, #f97316)">
            <FiCamera />
          </IconWrapper>
          <CardTitle>Photos</CardTitle>
        </CardLink>

        <CardLink onClick={() => navigate('/notes')}>
          <IconWrapper gradient="linear-gradient(135deg, #10b981, #14b8a6)">
            <FiList />
          </IconWrapper>
          <CardTitle>Notes</CardTitle>
        </CardLink>
      </Grid>

      <Section>
        <NotificationSettings />
      </Section>

      <Section>
        <PWAGuide />
      </Section>
    </Container>
  );
}
