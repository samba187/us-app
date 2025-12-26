import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiHome, FiList, FiBell, FiHeart, FiCamera, FiUser, FiClock } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const Bar = styled.nav`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: transparent;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 8px 14px;
  z-index: 100;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
`;

const Item = styled.button`
  background: transparent;
  border: none;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${p => p.active ? 'var(--primary-color)' : 'var(--text-color)'};
  opacity: ${p => p.active ? 1 : 0.85};
  gap: 4px;
  cursor: pointer;
  position: relative;
  padding: 4px;
  font-size: 11px;
  
  svg {
    font-size: 20px;
  }
  
  small {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

export function Navigation({ current, onNavigate }) {
  const routes = useMemo(() => ['/', '/wishlist', '/reminders', '/restaurants', '/photos', '/memories', '/notes'], []);
  // Déterminer l'index actif; si non trouvé, garder la première entrée
  const activeIndex = Math.max(0, routes.indexOf(current));
  const totalItems = routes.length;
  
  // Mesurer précisément la position/largeur de l'onglet actif
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 8, width: 0 });

  useEffect(() => {
    const update = () => {
      const el = itemRefs.current[activeIndex];
      if (el) {
        const left = el.offsetLeft + 8; // marge intérieure symétrique
        const width = Math.max(0, el.clientWidth - 16);
        setIndicator({ left, width });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeIndex]);
  return (
    <Bar className="nav-glass" role="navigation" aria-label="Navigation principale">
      <div style={{position:'absolute', left:0, right:0, top:0, bottom:0, pointerEvents:'none'}}>
        <div className="nav-indicator" style={{ left: indicator.left, width: indicator.width, transform: 'translateX(0)' }} />
      </div>
      <Item ref={el => (itemRefs.current[0] = el)} active={current==='/'} onClick={() => onNavigate('/')}> <FiHome /> <small>Accueil</small> </Item>
      <Item ref={el => (itemRefs.current[1] = el)} active={current==='/wishlist'} onClick={() => onNavigate('/wishlist')}> <FiHeart /> <small>Wishlist</small> </Item>
      <Item ref={el => (itemRefs.current[2] = el)} active={current==='/reminders'} onClick={() => onNavigate('/reminders')}> <FiBell /> <small>Rappels</small> </Item>
      <Item ref={el => (itemRefs.current[3] = el)} active={current==='/restaurants'} onClick={() => onNavigate('/restaurants')}> <MdRestaurant /> <small>Restos</small> </Item>
      <Item ref={el => (itemRefs.current[4] = el)} active={current==='/photos'} onClick={() => onNavigate('/photos')}> <FiCamera /> <small>Photos</small> </Item>
      <Item ref={el => (itemRefs.current[5] = el)} active={current==='/memories'} onClick={() => onNavigate('/memories')}> <FiClock /> <small>Souvenirs</small> </Item>
      <Item ref={el => (itemRefs.current[6] = el)} active={current==='/notes'} onClick={() => onNavigate('/notes')}> <FiList /> <small>Notes</small> </Item>
    </Bar>
  );
}

export default Navigation;
