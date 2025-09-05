import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Login from './components/Login'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Reminders from './pages/Reminders'
import Restaurants from './pages/Restaurants'
import Activities from './pages/Activities'
import Wishlist from './pages/Wishlist'
import Photos from './pages/Photos'
import Notes from './pages/Notes'

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-secondary);
  position: relative;
  overflow-x: hidden;
`

const BackgroundPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(245, 87, 108, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
  z-index: -1;
  animation: float 20s ease-in-out infinite;
`

const MainContent = styled(motion.main)`
  min-height: 100vh;
  padding-bottom: 80px;
  
  @media (max-width: 768px) {
    padding-bottom: 90px;
  }
`

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98
  }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('us_token')
    const userData = localStorage.getItem('us_user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('us_token', token)
    localStorage.setItem('us_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('us_token')
    localStorage.removeItem('us_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <AppContainer>
        <BackgroundPattern />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.5rem',
            color: 'var(--primary-color)',
            fontWeight: '600'
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: '50px',
              height: '50px',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              marginRight: '20px'
            }}
          />
          Chargement...
        </motion.div>
      </AppContainer>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppContainer>
        <BackgroundPattern />
        <Login onLogin={handleLogin} />
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <BackgroundPattern />
      <Navigation user={user} onLogout={handleLogout} />
      
      <MainContent
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </MainContent>
    </AppContainer>
  )
}

export default App
