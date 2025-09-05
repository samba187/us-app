import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Bell, 
  MapPin, 
  Calendar, 
  Heart, 
  Camera, 
  FileText, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  z-index: 1000;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 10px 0;
  }
  
  @media (min-width: 769px) {
    top: 0;
    bottom: auto;
    padding: 15px 0;
    border-top: none;
    border-bottom: 1px solid var(--border-color);
  }
`

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    justify-content: center;
    padding: 0 10px;
  }
`

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const NavLinks = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 5px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  transition: var(--transition);
  position: relative;
  min-width: 60px;
  
  &.active {
    color: var(--primary-color);
    background: rgba(102, 126, 234, 0.1);
  }
  
  &:hover {
    color: var(--primary-color);
    background: rgba(102, 126, 234, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.7rem;
    min-width: 50px;
  }
`

const IconWrapper = styled.div`
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    margin-bottom: 2px;
  }
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const UserInfo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--bg-muted);
  }
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`

const UserName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
`

const LogoutButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--error-color);
    background: rgba(239, 68, 68, 0.1);
  }
`

const MobileUserButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  z-index: 1001;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 80px;
  right: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-lg);
  z-index: 1002;
  min-width: 200px;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
`

const MobileLogout = styled.button`
  width: 100%;
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/reminders', icon: Bell, label: 'Rappels' },
  { path: '/restaurants', icon: MapPin, label: 'Restos' },
  { path: '/activities', icon: Calendar, label: 'Activités' },
  { path: '/wishlist', icon: Heart, label: 'Envies' },
  { path: '/photos', icon: Camera, label: 'Photos' },
  { path: '/notes', icon: FileText, label: 'Notes' },
]

function Navigation({ user, onLogout }) {
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Heart size={24} />
            US
          </Logo>

          <NavLinks>
            {navItems.map((item, index) => (
              <NavItem
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <IconWrapper>
                  <item.icon size={20} />
                </IconWrapper>
                {item.label}
              </NavItem>
            ))}
          </NavLinks>

          <UserSection>
            <UserInfo
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar>{getInitials(user?.name)}</Avatar>
              <UserName>{user?.name}</UserName>
            </UserInfo>
            
            <LogoutButton
              onClick={onLogout}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Déconnexion"
            >
              <LogOut size={18} />
            </LogoutButton>
          </UserSection>
        </NavContent>
      </NavContainer>

      <MobileUserButton
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </MobileUserButton>

      <AnimatePresence>
        {showMobileMenu && (
          <MobileMenu
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MobileUserInfo>
              <Avatar>{getInitials(user?.name)}</Avatar>
              <div>
                <UserName>{user?.name}</UserName>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {user?.email}
                </div>
              </div>
            </MobileUserInfo>
            
            <MobileLogout onClick={onLogout}>
              <LogOut size={18} />
              Déconnexion
            </MobileLogout>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navigation
