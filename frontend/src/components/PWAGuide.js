import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background:white; border:1px solid var(--border-color); border-radius:16px; padding:16px; box-shadow:var(--shadow);
`;

export default function PWAGuide() {
  return (
    <Card>
      <div style={{fontWeight:600, marginBottom:8}}>Installer l’application</div>
      <div style={{opacity:.85, fontSize:14}}>
        - Sur iPhone: Partager → « Sur l’écran d’accueil »<br/>
        - Sur Android: menu ⋮ → « Installer l’application »
      </div>
    </Card>
  );
}


