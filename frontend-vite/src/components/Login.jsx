import { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { authService, coupleService } from '../services/authService'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`

const LoginCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
  }
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 0 10px;
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`

const LogoIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 2rem;
  font-weight: bold;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 10px;
`

const Subtitle = styled.p`
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 30px;
  font-size: 0.95rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const InputGroup = styled.div`
  position: relative;
`

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 2;
`

const Input = styled.input`
  width: 100%;
  padding: 15px 50px 15px 45px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--primary-color);
  }
`

const Button = styled(motion.button)`
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 15px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`

const ToggleMode = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  margin-top: 20px;
  
  &:hover {
    color: var(--secondary-color);
  }
`

const ErrorMessage = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--error-color);
  font-size: 0.9rem;
  margin-bottom: 20px;
`

const LoadingSpinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  margin-right: 10px;
`

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      if (isLogin) {
        response = await authService.login(formData.email, formData.password)
      } else {
        response = await authService.register(formData.name, formData.email, formData.password)
      }

      if (response.token || response.access_token) {
        const token = response.token || response.access_token
        localStorage.setItem('us_token', token)
        localStorage.setItem('us_user', JSON.stringify(response.user))

        // Vérifier l'état couple après connexion
        try {
          const coupleStatus = await coupleService.me()
          if (coupleStatus.status === 'single') {
            window.location.href = '/onboarding-couple'
          } else {
            onLogin(response.user, token)
          }
        } catch {
          // Si erreur, continuer normalement
          onLogin(response.user, token)
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo>
          <LogoIcon
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart size={40} />
          </LogoIcon>
          <Title>US</Title>
          <Subtitle>
            {isLogin ? 'Connectez-vous à votre espace couple' : 'Créez votre espace couple'}
          </Subtitle>
        </Logo>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputGroup>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                name="name"
                placeholder="Votre prénom"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </InputGroup>
          )}

          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading && (
              <LoadingSpinner
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            {isLogin ? 'Se connecter' : 'Créer le compte'}
          </Button>
        </Form>

        <ToggleMode onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </ToggleMode>
      </LoginCard>
    </LoginContainer>
  )
}

export default Login
