import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color);
  margin-bottom: 12px;
`;

const Content = styled.div`
  font-size: 14px;
  color: var(--muted-text);
  line-height: 1.8;
`;

export default function PWAGuide() {
  return (
    <Card>
      <Title>Installer l'application</Title>
      <Content>
        - Sur iPhone: Partager → « Sur l'écran d'accueil »<br/>
        - Sur Android: menu ⋮ → « Installer l'application »
      </Content>
    </Card>
  );
}


