import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiBell, 
  FiMapPin, 
  FiCalendar, 
  FiHeart, 
  FiCamera, 
  FiFileText,
  FiPlus,
  FiUser
} from 'react-icons/fi';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
  padding: 10px 0;
  z-index: 1000;
  
  /* iOS safe area */
  padding-bottom: max(10px, env(safe-area-inset-bottom));
`;

const NavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 400px;
  margin: 0 auto;
  position: relative;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-decoration: none;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-light)'};
  transition: color 0.3s ease;
  font-size: 12px;
  font-weight: 500;
`;

const NavIcon = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`;

const AddButton = styled.button`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 107, 138, 0.3);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(-50%) translateY(-2px);
  }
`;

// Logout removed; moved to Profile page

const AddModal = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: flex-end;
  z-index: 2000;
`;

const AddMenu = styled.div`
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 30px 20px;
  width: 100%;
  max-height: 50vh;
  overflow-y: auto;
`;

const AddMenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  border: none;
  background: none;
  text-align: left;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: var(--background-color);
  }
`;

const AddMenuIcon = styled.div`
  font-size: 24px;
  margin-right: 15px;
  color: var(--primary-color);
`;

function Navigation() {
  const location = useLocation();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const navItems = [
    { path: '/', icon: FiHome, label: 'Accueil' },
    { path: '/reminders', icon: FiBell, label: 'Rappels' },
    { path: '/restaurants', icon: FiMapPin, label: 'Restos' },
    { path: '/activities', icon: FiCalendar, label: 'Activités' },
  ];

  const secondRowItems = [
    { path: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { path: '/photos', icon: FiCamera, label: 'Photos' },
    { path: '/notes', icon: FiFileText, label: 'Notes' },
    { path: '/profile', icon: FiUser, label: 'Profil' },
  ];

  const addMenuItems = [
    { label: 'Nouveau rappel', icon: FiBell, action: () => console.log('Nouveau rappel') },
    { label: 'Nouveau resto', icon: FiMapPin, action: () => console.log('Nouveau resto') },
    { label: 'Nouvelle activité', icon: FiCalendar, action: () => console.log('Nouvelle activité') },
    { label: 'Nouveau souhait', icon: FiHeart, action: () => console.log('Nouveau souhait') },
    { label: 'Nouvelle photo', icon: FiCamera, action: () => console.log('Nouvelle photo') },
    { label: 'Nouvelle note', icon: FiFileText, action: () => console.log('Nouvelle note') },
  ];

  return (
    <>
      <NavContainer>
        <NavGrid>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
            >
              <NavIcon>
                <item.icon />
              </NavIcon>
              {item.label}
            </NavItem>
          ))}
          
          <AddButton onClick={() => setShowAddMenu(true)}>
            <FiPlus />
          </AddButton>
        </NavGrid>
        
        <NavGrid style={{ marginTop: '10px' }}>
          {secondRowItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
            >
              <NavIcon>
                <item.icon />
              </NavIcon>
              {item.label}
            </NavItem>
          ))}
        </NavGrid>
      </NavContainer>

      <AddModal show={showAddMenu} onClick={() => setShowAddMenu(false)}>
        <AddMenu onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Ajouter quelque chose</h3>
          {addMenuItems.map((item, index) => (
            <AddMenuItem
              key={index}
              onClick={() => {
                item.action();
                setShowAddMenu(false);
              }}
            >
              <AddMenuIcon>
                <item.icon />
              </AddMenuIcon>
              {item.label}
            </AddMenuItem>
          ))}
        </AddMenu>
      </AddModal>
    </>
  );
}

export default Navigation;
