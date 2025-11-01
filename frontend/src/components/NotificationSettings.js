import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ensurePushSubscribed, getPermissionStatus, testPush } from '../services/notificationService';

const Wrap = styled.div`
  background: white; border:1px solid var(--border-color); border-radius: 16px; padding: 16px; box-shadow: var(--shadow);
`;

const Row = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;
`;

const Button = styled.button`
  background: var(--primary-color); color:#fff; border:none; border-radius:10px; padding:10px 14px; cursor:pointer;
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
          <div style={{fontWeight:600}}>Notifications</div>
          <div style={{opacity:.8, fontSize:13}}>Statut: {status}</div>
        </div>
        {status !== 'granted' ? (
          <Button onClick={enable} disabled={busy}>{busy ? '...' : 'Activer'}</Button>
        ) : (
          <Button onClick={sendTest}>Tester</Button>
        )}
      </Row>
    </Wrap>
  );
}


