import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PWAGuideContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const GuideContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 350px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 24px;
`;

const Step = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const StepNumber = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-weight: 600;
  font-size: 12px;
  margin-right: 10px;
`;

const StepText = styled.span`
  font-size: 14px;
  line-height: 1.4;
`;

const Icon = styled.div`
  font-size: 20px;
  margin: 0 5px;
  display: inline-block;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
`;

const DismissButton = styled.button`
  background: transparent;
  color: var(--text-light);
  border: none;
  padding: 8px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 10px;
`;

export default function PWAGuide() {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur iOS et si l'app n'est pas déjà installée
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const hasSeenGuide = localStorage.getItem('pwa_guide_seen');
    
    if (isIOS && !isInStandaloneMode && !hasSeenGuide) {
      // Attendre un peu avant d'afficher le guide
      setTimeout(() => setShowGuide(true), 2000);
    }
  }, []);

  const handleClose = () => {
    setShowGuide(false);
    localStorage.setItem('pwa_guide_seen', 'true');
  };

  const handleDismiss = () => {
    setShowGuide(false);
    // Ne pas marquer comme vu pour qu'il revienne la prochaine fois
  };

  if (!showGuide) return null;

  return (
    <PWAGuideContainer show={showGuide}>
      <GuideContent>
        <Title>📱 Installer l'app</Title>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Pour une meilleure expérience, installe l'app sur ton écran d'accueil !
        </p>
        
        <Step>
          <StepNumber>1</StepNumber>
          <StepText>
            Appuie sur le bouton <Icon>📤</Icon> de partage en bas de Safari
          </StepText>
        </Step>
        
        <Step>
          <StepNumber>2</StepNumber>
          <StepText>
            Fais défiler et appuie sur <Icon>➕</Icon> "Sur l'écran d'accueil"
          </StepText>
        </Step>
        
        <Step>
          <StepNumber>3</StepNumber>
          <StepText>
            Appuie sur "Ajouter" en haut à droite
          </StepText>
        </Step>
        
        <p style={{ fontSize: '12px', color: '#888', marginTop: '15px' }}>
          L'app apparaîtra sur ton écran d'accueil comme une vraie app ! 🎉
        </p>
        
        <CloseButton onClick={handleClose}>
          J'ai compris !
        </CloseButton>
        
        <div>
          <DismissButton onClick={handleDismiss}>
            Plus tard
          </DismissButton>
        </div>
      </GuideContent>
    </PWAGuideContainer>
  );
}
