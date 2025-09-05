import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Heart, Users, Copy, Check } from 'lucide-react';
import { coupleService } from '../services/authService';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const OnboardingCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
`;

const OptionButton = styled(motion.button)`
  width: 100%;
  padding: 20px;
  margin: 10px 0;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #333;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }

  &.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }
`;

const CodeContainer = styled.div`
  background: #f5f5f5;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  border: 2px dashed #ddd;
`;

const CodeDisplay = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  letter-spacing: 5px;
  margin: 10px 0;
`;

const CopyButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
`;

const CodeInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 20px 0;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 20px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-top: 20px;
  text-decoration: underline;
`;

const OnboardingCouple = () => {
  const [step, setStep] = useState('choose'); // 'choose', 'create', 'join'
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const createSpace = async () => {
    setLoading(true);
    try {
      const response = await coupleService.create();
      setGeneratedCode(response.code);
      setStep('create');
    } catch (error) {
      console.error('Erreur création couple:', error);
      alert('Erreur lors de la création de l\'espace couple');
    }
    setLoading(false);
  };

  const joinSpace = async () => {
    if (!inputCode || inputCode.length !== 6) {
      alert('Veuillez entrer un code à 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await coupleService.join(inputCode.toUpperCase());
      // Rediriger vers la page d'accueil
      window.location.href = '/home';
    } catch (error) {
      console.error('Erreur join couple:', error);
      alert('Code invalide ou déjà utilisé');
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkConnection = async () => {
    setLoading(true);
    try {
      const status = await coupleService.me();
      if (status.status === 'coupled') {
        window.location.href = '/home';
      }
    } catch (error) {
      console.log('Pas encore connecté');
    }
    setLoading(false);
  };

  return (
    <OnboardingContainer>
      <OnboardingCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 'choose' && (
          <>
            <Title>
              <Heart size={32} />
              Espace Couple
            </Title>
            <Subtitle>
              Créez ou rejoignez un espace couple pour partager vos souvenirs ensemble
            </Subtitle>

            <OptionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createSpace}
              disabled={loading}
            >
              <Users size={24} />
              Créer un nouvel espace
            </OptionButton>

            <OptionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('join')}
            >
              <Heart size={24} />
              Rejoindre un espace existant
            </OptionButton>
          </>
        )}

        {step === 'create' && (
          <>
            <Title>
              <Users size={32} />
              Espace créé !
            </Title>
            <Subtitle>
              Partagez ce code avec votre partenaire pour qu'il puisse vous rejoindre
            </Subtitle>

            <CodeContainer>
              <p>Votre code d'invitation :</p>
              <CodeDisplay>{generatedCode}</CodeDisplay>
              <CopyButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCode}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copié !' : 'Copier le code'}
              </CopyButton>
            </CodeContainer>

            <ActionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkConnection}
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Vérifier la connexion'}
            </ActionButton>

            <BackButton onClick={() => setStep('choose')}>
              Retour
            </BackButton>
          </>
        )}

        {step === 'join' && (
          <>
            <Title>
              <Heart size={32} />
              Rejoindre un espace
            </Title>
            <Subtitle>
              Entrez le code d'invitation que votre partenaire vous a donné
            </Subtitle>

            <CodeInput
              type="text"
              placeholder="XXXXXX"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
            />

            <ActionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={joinSpace}
              disabled={loading || inputCode.length !== 6}
            >
              {loading ? 'Connexion...' : 'Rejoindre l\'espace'}
            </ActionButton>

            <BackButton onClick={() => setStep('choose')}>
              Retour
            </BackButton>
          </>
        )}
      </OnboardingCard>
    </OnboardingContainer>
  );
};

export default OnboardingCouple;
