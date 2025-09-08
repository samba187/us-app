// Service de gestion des notifications PWA
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = Notification.permission;
  }

  // Initialiser le service worker et demander la permission
  async init() {
    if (!this.isSupported) {
      console.log('Les notifications ne sont pas supportées');
      return false;
    }

    try {
      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker enregistré:', registration);

      // Demander la permission pour les notifications
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }

      return this.permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      return false;
    }
  }

  // Vérifier si les notifications sont activées
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Demander explicitement la permission
  async requestPermission() {
    if (!this.isSupported) return false;
    
    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Envoyer une notification locale
  async showNotification(title, options = {}) {
    if (!this.isEnabled()) {
      console.log('Notifications non autorisées');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const defaultOptions = {
        body: 'Nouveau rappel ajouté !',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '1'
        },
        actions: [
          {
            action: 'explore',
            title: 'Voir',
            icon: '/favicon.ico'
          },
          {
            action: 'close',
            title: 'Fermer',
            icon: '/favicon.ico'
          }
        ],
        requireInteraction: false,
        silent: false
      };

      const notificationOptions = { ...defaultOptions, ...options };
      
      await registration.showNotification(title, notificationOptions);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      return false;
    }
  }

  // Notification pour un nouveau rappel
  async notifyNewReminder(reminder) {
    const title = '📝 Nouveau rappel';
    const options = {
      body: `"${reminder.title}" - Priorité: ${reminder.priority}`,
      icon: '/favicon.ico',
      data: {
        type: 'reminder',
        reminderId: reminder._id,
        url: '/rappels'
      },
      actions: [
        {
          action: 'view',
          title: 'Voir le rappel',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'OK',
          icon: '/favicon.ico'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Notification pour un rappel urgent
  async notifyUrgentReminder(reminder) {
    const title = '🚨 Rappel urgent !';
    const options = {
      body: `"${reminder.title}" - À faire rapidement !`,
      icon: '/favicon.ico',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        type: 'urgent_reminder',
        reminderId: reminder._id,
        url: '/rappels'
      }
    };

    return this.showNotification(title, options);
  }

  // Notification pour rappel dû bientôt
  async notifyReminderDue(reminder) {
    const dueDate = new Date(reminder.due_date);
    const now = new Date();
    const diffHours = Math.round((dueDate - now) / (1000 * 60 * 60));
    
    const title = '⏰ Rappel à venir';
    const options = {
      body: diffHours > 0 
        ? `"${reminder.title}" - Dans ${diffHours}h`
        : `"${reminder.title}" - Maintenant !`,
      icon: '/favicon.ico',
      data: {
        type: 'due_reminder',
        reminderId: reminder._id,
        url: '/rappels'
      }
    };

    return this.showNotification(title, options);
  }

  // Vérifier et programmer les notifications pour les rappels dus
  async scheduleReminderNotifications(reminders) {
    if (!this.isEnabled()) return;

    const now = new Date();
    
    reminders.forEach(reminder => {
      if (reminder.due_date && reminder.status !== 'done') {
        const dueDate = new Date(reminder.due_date);
        const timeDiff = dueDate - now;
        
        // Notifier 1 heure avant
        if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000) {
          setTimeout(() => {
            this.notifyReminderDue(reminder);
          }, timeDiff - (60 * 60 * 1000)); // 1h avant
        }
        
        // Notifier à l'heure
        if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
          setTimeout(() => {
            this.notifyReminderDue(reminder);
          }, timeDiff);
        }
      }
    });
  }

  // Test de notification
  async testNotification() {
    return this.showNotification('🧪 Test de notification', {
      body: 'Si tu vois ça, les notifications fonctionnent !',
      requireInteraction: false
    });
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;
