import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import notificationService from '../services/notificationService';

const NotificationContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
`;

const Title = styled.h3`
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 18px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: var(--text-color);
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
`;

const Toggle = styled.div`
  width: 50px;
  height: 28px;
  background: ${props => props.active ? 'linear-gradient(135deg, #ff6b8a, #4ecdc4)' : '#ccc'};
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '24px' : '2px'};
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 10px;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'granted': return '#d4edda';
      case 'denied': return '#f8d7da';
      default: return '#fff3cd';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'granted': return '#155724';
      case 'denied': return '#721c24';
      default: return '#856404';
    }
  }};
`;

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [settings, setSettings] = useState({
    newReminders: true,
    urgentReminders: true,
    dueDateReminders: true
  });

  useEffect(() => {
    // Vérifier le support et la permission
    setIsSupported(notificationService.isSupported);
    setPermission(notificationService.permission);

    // Charger les paramètres depuis localStorage
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const handlePermissionRequest = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      // Initialiser le service worker
      await notificationService.init();
    }
  };

  const handleTest = async () => {
    const success = await notificationService.testNotification();
    if (!success) {
      alert('Erreur lors de l\'envoi de la notification de test');
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  if (!isSupported) {
    return (
      <NotificationContainer>
        <Title>🔔 Notifications</Title>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          Les notifications ne sont pas supportées sur ce navigateur.
        </p>
      </NotificationContainer>
    );
  }

  return (
    <NotificationContainer>
      <Title>🔔 Notifications</Title>
      
      <SettingItem>
        <div>
          <SettingLabel>Statut des notifications</SettingLabel>
          <SettingDescription>
            <StatusBadge status={permission}>
              {permission === 'granted' ? 'Autorisées' : 
               permission === 'denied' ? 'Refusées' : 'En attente'}
            </StatusBadge>
          </SettingDescription>
        </div>
        <div>
          {permission !== 'granted' && (
            <Button onClick={handlePermissionRequest}>
              Autoriser
            </Button>
          )}
          {permission === 'granted' && (
            <Button onClick={handleTest}>
              Tester
            </Button>
          )}
        </div>
      </SettingItem>

      {permission === 'granted' && (
        <>
          <SettingItem>
            <div>
              <SettingLabel>Nouveaux rappels</SettingLabel>
              <SettingDescription>Notifier lors de l&apos;ajout d&apos;un rappel</SettingDescription>
            </div>
            <Toggle 
              active={settings.newReminders}
              onClick={() => toggleSetting('newReminders')}
            />
          </SettingItem>

          <SettingItem>
            <div>
              <SettingLabel>Rappels urgents</SettingLabel>
              <SettingDescription>Notifications spéciales pour les priorités urgentes</SettingDescription>
            </div>
            <Toggle 
              active={settings.urgentReminders}
              onClick={() => toggleSetting('urgentReminders')}
            />
          </SettingItem>

          <SettingItem>
            <div>
              <SettingLabel>Échéances</SettingLabel>
              <SettingDescription>Notifier avant les dates d&apos;échéance</SettingDescription>
            </div>
            <Toggle 
              active={settings.dueDateReminders}
              onClick={() => toggleSetting('dueDateReminders')}
            />
          </SettingItem>
        </>
      )}
    </NotificationContainer>
  );
}
