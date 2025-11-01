import React from 'react';
import styled from 'styled-components';
import NotificationSettings from '../components/NotificationSettings';
import PWAGuide from '../components/PWAGuide';

const Container = styled.div` padding: 15px; max-width: 800px; margin: 0 auto; `;
const Title = styled.h1` margin:0 0 14px 0; color:var(--text-color); `;
const Grid = styled.div` display:grid; grid-template-columns: repeat(2,1fr); gap:12px; `;
const CardLink = styled.a` text-decoration:none; color:inherit; background:#fff; border:1px solid var(--border-color); border-radius:14px; padding:16px; box-shadow:var(--shadow); display:block; `;

export default function Home({ navigate }) {
  return (
    <Container>
      <Title>Bienvenue</Title>
      <Grid>
        <CardLink href="#/wishlist" onClick={(e)=>{e.preventDefault(); navigate('/wishlist');}}>Wishlist</CardLink>
        <CardLink href="#/reminders" onClick={(e)=>{e.preventDefault(); navigate('/reminders');}}>Rappels</CardLink>
        <CardLink href="#/photos" onClick={(e)=>{e.preventDefault(); navigate('/photos');}}>Photos</CardLink>
        <CardLink href="#/notes" onClick={(e)=>{e.preventDefault(); navigate('/notes');}}>Notes</CardLink>
      </Grid>
      <div style={{height:12}} />
      <NotificationSettings />
      <div style={{height:12}} />
      <PWAGuide />
    </Container>
  );
}


