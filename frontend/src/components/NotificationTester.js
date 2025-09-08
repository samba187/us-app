import React from 'react';
import styled from 'styled-components';
import notificationService from '../services/notificationService';

const TestContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: var(--shadow);
  z-index: 1000;
  max-width: 200px;
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #ff6b8a, #4ecdc4);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin: 2px;
  width: 100%;
`;

export default function NotificationTester() {
  // Seulement en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testBasic = async () => {
    await notificationService.testNotification();
  };

  const testReminder = async () => {
    const mockReminder = {
      _id: 'test-123',
      title: 'Test Rappel',
      priority: 'normal'
    };
    await notificationService.notifyNewReminder(mockReminder);
  };

  const testUrgent = async () => {
    const mockReminder = {
      _id: 'urgent-123',
      title: 'Rappel Urgent !',
      priority: 'urgent'
    };
    await notificationService.notifyUrgentReminder(mockReminder);
  };

  const testDue = async () => {
    const mockReminder = {
      _id: 'due-123',
      title: 'Rappel à échéance',
      due_date: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
    await notificationService.notifyReminderDue(mockReminder);
  };

  return (
    <TestContainer>
      <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
        🧪 Test Notifications
      </div>
      <TestButton onClick={testBasic}>Basic</TestButton>
      <TestButton onClick={testReminder}>Rappel</TestButton>
      <TestButton onClick={testUrgent}>Urgent</TestButton>
      <TestButton onClick={testDue}>Échéance</TestButton>
    </TestContainer>
  );
}
