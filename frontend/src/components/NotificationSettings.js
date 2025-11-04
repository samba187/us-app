import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ensurePushSubscribed, getPermissionStatus, testPush } from '../services/notificationService';

const Wrap = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-1), var(--neon-3));
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default function NotificationSettings() {
  const [status, setStatus] = useState('default');
  const [busy, setBusy] = useState(false);

  useEffect(() => { (async () => setStatus(await getPermissionStatus()))(); }, []);

  const enable = async () => {
    setBusy(true);
    try { await ensurePushSubscribed(); setStatus('granted'); }
    catch { alert("Impossible d'activer les notifications"); }
    setBusy(false);
  };

  const sendTest = async () => {
    try { await testPush(); alert('Notification de test envoyée'); }
    catch (e) { alert('Échec de test: ' + (e?.response?.data?.error || e.message)); }
  };

  return (
    <Wrap>
      <Row>
        <div>
          <div style={{fontWeight:600, fontSize:16, color:'var(--text-color)', marginBottom:4}}>Notifications</div>
          <div style={{fontSize:13, color:'var(--muted-text)'}}>Statut: {status}</div>
        </div>
        {status !== 'granted' ? (
          <Button onClick={enable} disabled={busy}>{busy ? 'Activation...' : 'Activer'}</Button>
        ) : (
          <Button onClick={sendTest}>Tester</Button>
        )}
      </Row>
    </Wrap>
  );
}


