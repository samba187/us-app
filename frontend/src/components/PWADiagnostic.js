import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DiagnosticContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  font-size: 12px;
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ff6b8a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 18px;
  cursor: pointer;
  z-index: 10000;
`;

function PWADiagnostic() {
  // Auto-ouverture si pas de token ou si ?diag=1 dans l'URL
  const shouldAutoOpen = !localStorage.getItem('us_token') || window.location.search.includes('diag=1');
  const [showDiagnostic, setShowDiagnostic] = useState(shouldAutoOpen);
  const [diagnosticInfo, setDiagnosticInfo] = useState([]);
  const [version] = useState(() => {
    // Version simple basée sur date build chargee
    return 'v' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
  });

  useEffect(() => {
    const info = [];
    
    // Informations de base
    info.push(`📱 User Agent: ${navigator.userAgent.substring(0, 100)}...`);
    info.push(`🌐 URL: ${window.location.href}`);
    info.push(`📦 Local Storage Items: ${localStorage.length}`);
    
  // Vérifier le token
    const token = localStorage.getItem('us_token');
    const userData = localStorage.getItem('us_user');
    info.push(`🔑 Token présent: ${!!token}`);
    info.push(`👤 User data présent: ${!!userData}`);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isValid = payload.exp * 1000 > Date.now();
        info.push(`✅ Token valide: ${isValid}`);
        info.push(`⏰ Token expire: ${new Date(payload.exp * 1000).toLocaleString()}`);
      } catch (error) {
        info.push(`❌ Erreur token: ${error.message}`);
      }
    }
    
    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        info.push(`🔧 Service Workers: ${registrations.length}`);
        registrations.forEach((registration, index) => {
          info.push(`SW${index}: ${registration.active?.state || 'N/A'}`);
        });
        setDiagnosticInfo([...info]);
      });
    } else {
      info.push(`❌ Service Worker non supporté`);
    }
    
    // PWA
    info.push(`📲 PWA mode: ${window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}`);
    
    // Network
    info.push(`📶 Online: ${navigator.onLine}`);
    
    // Ajouter info sur dimensions viewport
    info.push(`📐 Viewport: ${window.innerWidth}x${window.innerHeight}`);
    info.push(`🕒 Chargé à: ${new Date().toLocaleTimeString()}`);
    info.push(`🏷️ Version: ${version}`);

    setDiagnosticInfo(info);
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const reinstallSW = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      window.location.reload();
    }
  };

  if (!showDiagnostic) {
    return (
      <ToggleButton onClick={() => setShowDiagnostic(true)}>
        🔍
      </ToggleButton>
    );
  }

  return (
    <>
      <DiagnosticContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong>🔍 PWA Diagnostic ({version})</strong>
          <button onClick={() => setShowDiagnostic(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>❌</button>
        </div>
        
        {diagnosticInfo.map((info, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {info}
          </div>
        ))}
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button onClick={clearStorage} style={{ background: '#ff6b8a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>
            🗑️ Clear Storage
          </button>
          <button onClick={reinstallSW} style={{ background: '#4ecdc4', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>
            🔄 Reinstall SW
          </button>
          <button onClick={() => window.location.reload()} style={{ background: '#333', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>
            🔄 Reload
          </button>
        </div>
      </DiagnosticContainer>
      
      <ToggleButton onClick={() => setShowDiagnostic(false)}>
        ❌
      </ToggleButton>
    </>
  );
}

export default PWADiagnostic;