import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiHeart, FiUserPlus, FiCopy, FiCheck } from 'react-icons/fi';
import { authService } from '../services/authService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
`;

const Container = styled.div`
  padding: 20px 16px;
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  @media (max-width: 768px) { padding: 16px 12px; }
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: var(--muted-text);
  font-size: 16px;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  margin-bottom: 20px;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardDescription = styled.div`
  color: var(--muted-text);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  &::placeholder {
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuccessCard = styled(Card)`
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
`;

const CodeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(124, 58, 237, 0.15);
  border: 2px solid rgba(124, 58, 237, 0.3);
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--neon-1);
  margin: 12px 0;
`;

const CopyButton = styled.button`
  padding: 8px 12px;
  border: 1px solid rgba(124, 58, 237, 0.5);
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--neon-1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(124, 58, 237, 0.2);
  }
`;

const MembersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
`;

const MemberItem = styled.li`
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

const Divider = styled.div`
  text-align: center;
  color: var(--muted-text);
  margin: 24px 0;
  position: relative;
  
  &::before, &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::before { left: 0; }
  &::after { right: 0; }
`;

export default function OnboardingCouple({ navigate }) {
  const [me, setMe] = useState(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const r = await authService.api.get('/api/couple/me');
      setMe(r.data);
      if (r.data?.in_couple && navigate) {
        // Rediriger vers home après 2s si couple créé
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await authService.api.post('/api/couple/create');
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const join = async () => {
    if (!code.trim()) return;
    try {
      await authService.api.post('/api/couple/join', { invite_code: code });
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(me?.invite_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <Hero>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💕</div>
        <Title>Connexion de couple</Title>
        <Subtitle>
          {me?.in_couple
            ? 'Votre couple est connecté ! Vous pouvez maintenant partager vos souvenirs.'
            : 'Pour utiliser US, créez un couple ou rejoignez celui de votre partenaire.'}
        </Subtitle>
      </Hero>

      {me?.in_couple ? (
        <SuccessCard>
          <CardTitle>
            <FiCheck size={24} color="#10b981" />
            Vous êtes en couple
          </CardTitle>
          <CardDescription>
            Partagez ce code pour que votre partenaire rejoigne :
          </CardDescription>
          <div style={{ textAlign: 'center' }}>
            <CodeBadge>
              {me.invite_code || '—'}
              <CopyButton onClick={copyCode}>
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Copié !' : 'Copier'}
              </CopyButton>
            </CodeBadge>
          </div>
          {me.members && me.members.length > 0 && (
            <>
              <CardDescription style={{ marginTop: 16, marginBottom: 8 }}>
                Membres du couple :
              </CardDescription>
              <MembersList>
                {me.members.map(m => (
                  <MemberItem key={m.id}>
                    <FiHeart color="var(--neon-3)" />
                    <div>
                      <strong>{m.name}</strong>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{m.email}</div>
                    </div>
                  </MemberItem>
                ))}
              </MembersList>
            </>
          )}
        </SuccessCard>
      ) : (
        <>
          <Card>
            <CardTitle>
              <FiHeart size={22} color="var(--neon-3)" />
              Créer un nouveau couple
            </CardTitle>
            <CardDescription>
              Vous serez le premier membre. Vous recevrez un code à partager avec votre partenaire.
            </CardDescription>
            <Button onClick={create}>
              <FiUserPlus /> Créer mon couple
            </Button>
          </Card>

          <Divider>OU</Divider>

          <Card>
            <CardTitle>
              <FiUserPlus size={22} color="var(--neon-2)" />
              Rejoindre avec un code
            </CardTitle>
            <CardDescription>
              Entrez le code d'invitation fourni par votre partenaire :
            </CardDescription>
            <Input
              placeholder="Ex: ABC123"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <div style={{ height: 12 }} />
            <Button onClick={join}>
              <FiHeart /> Rejoindre
            </Button>
          </Card>
        </>
      )}
    </Container>
  );
}
