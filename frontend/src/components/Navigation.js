import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FiHome, FiList, FiBell, FiHeart, FiCamera, FiUser } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const Bar = styled.nav`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: transparent;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 10px 8px 14px;
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
  opacity: ${p => p.active ? 1 : 0.85};
  gap: 4px;
  cursor: pointer;
  position: relative;
`;

export function Navigation({ current, onNavigate }) {
  const routes = useMemo(() => ['/', '/wishlist', '/reminders', '/restaurants', '/photos', '/notes'], []);
  const activeIndex = Math.max(0, routes.findIndex(r => r === current));
  return (
    <Bar className="nav-glass" role="navigation" aria-label="Navigation principale">
      <div style={{position:'absolute', left:0, right:0, top:0, bottom:0, pointerEvents:'none'}}>
        <div className="nav-indicator" style={{transform:`translateX(calc(${activeIndex} * 100%))`}} />
      </div>
      <Item active={current==='/'} onClick={() => onNavigate('/')}> <FiHome /> <small>Accueil</small> </Item>
      <Item active={current==='/wishlist'} onClick={() => onNavigate('/wishlist')}> <FiHeart /> <small>Wishlist</small> </Item>
      <Item active={current==='/reminders'} onClick={() => onNavigate('/reminders')}> <FiBell /> <small>Rappels</small> </Item>
      <Item active={current==='/restaurants'} onClick={() => onNavigate('/restaurants')}> <MdRestaurant /> <small>Restos</small> </Item>
      <Item active={current==='/photos'} onClick={() => onNavigate('/photos')}> <FiCamera /> <small>Photos</small> </Item>
      <Item active={current==='/notes'} onClick={() => onNavigate('/notes')}> <FiList /> <small>Notes</small> </Item>
    </Bar>
  );
}

export default Navigation;
