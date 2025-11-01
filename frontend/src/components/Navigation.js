import React from 'react';
import styled from 'styled-components';
import { FiHome, FiList, FiBell, FiHeart, FiCamera, FiUser } from 'react-icons/fi';

const Bar = styled.nav`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #fff;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 8px 10px;
  z-index: 100;
`;

const Item = styled.button`
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${p => p.active ? 'var(--primary-color)' : 'var(--text-color)'};
  opacity: ${p => p.active ? 1 : 0.8};
  gap: 4px;
  cursor: pointer;
`;

export function Navigation({ current, onNavigate }) {
  return (
    <Bar>
      <Item active={current==='/'} onClick={() => onNavigate('/')}> <FiHome /> <small>Accueil</small> </Item>
      <Item active={current==='/wishlist'} onClick={() => onNavigate('/wishlist')}> <FiHeart /> <small>Wishlist</small> </Item>
      <Item active={current==='/reminders'} onClick={() => onNavigate('/reminders')}> <FiBell /> <small>Rappels</small> </Item>
      <Item active={current==='/photos'} onClick={() => onNavigate('/photos')}> <FiCamera /> <small>Photos</small> </Item>
      <Item active={current==='/notes'} onClick={() => onNavigate('/notes')}> <FiList /> <small>Notes</small> </Item>
      <Item active={current==='/profile'} onClick={() => onNavigate('/profile')}> <FiUser /> <small>Profil</small> </Item>
    </Bar>
  );
}

export default Navigation;
