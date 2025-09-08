import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Heart, Users, Copy } from 'lucide-react';
import { coupleService } from '../services/authService';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: #2d3748;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const OptionCard = styled(motion.div)`
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  padding: 2rem;
  margin: 1.5rem 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
  }
`;

const OptionTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 1rem 0;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ErrorMessage = styled(motion.div)`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border: 1px solid #feb2b2;
`;

const CodeDisplay = styled.div`
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1rem 0;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 4px;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function OnboardingCouple() {
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    coupleService.me().then((data) => {
      if (data.status === 'coupled') {
        window.location.href = '/';
      }
    }).catch(() => {
      // Ignore les erreurs, l'utilisateur n'est pas encore lié
    }).finally(() => setLoading(false));
  }, []);

  const createSpace = async () => {
    setCreating(true);
    setErr('');
    try {
      const res = await coupleService.create();
      setGeneratedCode(res.code);
    } catch (e) {
      setErr(e.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const joinSpace = async (e) => {
    e.preventDefault();
    if (!invite.trim()) return;
    
    setJoining(true);
    setErr('');
    try {
      await coupleService.join(invite.trim().toUpperCase());
      window.location.href = '/';
    } catch (e) {
      setErr(e.response?.data?.error || 'Code invalide');
    } finally {
      setJoining(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copié !');
  };

  if (loading) {
    return (
      <Container>
        <Card
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner />
          <p>Chargement…</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>
          <Heart size={32} color="#667eea" />
          Relier votre espace à deux
        </Title>

        {!generatedCode ? (
          <>
            <OptionCard
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptionTitle>
                <Users size={24} color="#667eea" />
                Créer notre espace
              </OptionTitle>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                Générez un code d'invitation pour votre partenaire
              </p>
              <Button
                onClick={createSpace}
                disabled={creating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {creating ? 'Création...' : 'Créer notre espace'}
              </Button>
            </OptionCard>

            <OptionCard
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptionTitle>
                <Heart size={24} color="#764ba2" />
                Rejoindre mon/ma partenaire
              </OptionTitle>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                Entrez le code d'invitation reçu
              </p>
              <form onSubmit={joinSpace}>
                <Input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder="CODE123"
                  maxLength={6}
                />
                <Button
                  type="submit"
                  disabled={joining || !invite.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joining ? 'Connexion...' : 'Rejoindre'}
                </Button>
              </form>
            </OptionCard>
          </>
        ) : (
          <OptionCard>
            <OptionTitle>
              <Users size={24} color="#48bb78" />
              Espace créé avec succès !
            </OptionTitle>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              Partagez ce code avec votre partenaire :
            </p>
            <CodeDisplay>
              {generatedCode}
              <Copy 
                size={24} 
                onClick={copyCode} 
                style={{ cursor: 'pointer', color: '#667eea' }}
              />
            </CodeDisplay>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>
              Une fois votre partenaire connecté(e), vous accéderez automatiquement à l'application.
            </p>
          </OptionCard>
        )}

        {err && (
          <ErrorMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {err}
          </ErrorMessage>
        )}
      </Card>
    </Container>
  );
}
