// Service de notifications croisées entre les deux utilisateurs du couple
import notificationService from './notificationService';

class CrossNotificationService {
  constructor() {
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastChecked = Date.now();
    this.notificationHistory = new Set(); // Pour éviter les doublons
  }

  // Démarrer le système de notifications croisées
  async startCrossNotifications() {
    if (this.isPolling) return;
    
    // Initialiser les notifications PWA
    await notificationService.init();
    
    this.isPolling = true;
    this.lastChecked = Date.now();
    
    // Vérifier les nouvelles activités toutes les 30 secondes
    this.pollingInterval = setInterval(() => {
      this.checkForNewActivity();
    }, 30000);
    
    console.log('🔔 Système de notifications croisées démarré');
  }

  // Arrêter le système
  stopCrossNotifications() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('🔕 Système de notifications croisées arrêté');
  }

  // Vérifier les nouvelles activités depuis la dernière vérification
  async checkForNewActivity() {
    try {
      const now = Date.now();
      const timeSince = new Date(this.lastChecked);
      
      // Récupérer l'utilisateur actuel
      const currentUser = JSON.parse(localStorage.getItem('us_user') || '{}');
      if (!currentUser._id) return;

      // Vérifier les nouveaux rappels
      await this.checkNewReminders(currentUser._id, timeSince);
      
      // Vérifier les nouveaux items de wishlist
      await this.checkNewWishlistItems(currentUser._id, timeSince);
      
      // Vérifier les nouvelles activités
      await this.checkNewActivities(currentUser._id, timeSince);
      
      // Vérifier les nouveaux restaurants
      await this.checkNewRestaurants(currentUser._id, timeSince);

      this.lastChecked = now;
    } catch (error) {
      console.error('Erreur lors de la vérification des nouvelles activités:', error);
    }
  }

  // Vérifier les nouveaux rappels ajoutés par le/la partenaire
  async checkNewReminders(currentUserId, since) {
    try {
      const { reminderService } = await import('./authService');
      const reminders = await reminderService.getAll();
      
      const newReminders = reminders.filter(reminder => {
        const createdAt = new Date(reminder.created_at);
        const notificationId = `reminder_${reminder._id}`;
        
        return createdAt > since && 
               reminder.created_by !== currentUserId && 
               !this.notificationHistory.has(notificationId);
      });

      for (const reminder of newReminders) {
        const notificationId = `reminder_${reminder._id}`;
        await this.notifyPartnerActivity('reminder', reminder);
        this.notificationHistory.add(notificationId);
      }
    } catch (error) {
      console.error('Erreur vérification rappels:', error);
    }
  }

  // Vérifier les nouveaux items de wishlist
  async checkNewWishlistItems(currentUserId, since) {
    try {
      const { wishlistService } = await import('./authService');
      const wishlistItems = await wishlistService.getAll();
      
      const newItems = wishlistItems.filter(item => {
        const createdAt = new Date(item.created_at);
        const notificationId = `wishlist_${item._id}`;
        
        return createdAt > since && 
               item.created_by !== currentUserId && 
               !this.notificationHistory.has(notificationId);
      });

      for (const item of newItems) {
        const notificationId = `wishlist_${item._id}`;
        await this.notifyPartnerActivity('wishlist', item);
        this.notificationHistory.add(notificationId);
      }
    } catch (error) {
      console.error('Erreur vérification wishlist:', error);
    }
  }

  // Vérifier les nouvelles activités
  async checkNewActivities(currentUserId, since) {
    try {
      const { activityService } = await import('./authService');
      const activities = await activityService.getAll();
      
      const newActivities = activities.filter(activity => {
        const createdAt = new Date(activity.created_at);
        const notificationId = `activity_${activity._id}`;
        
        return createdAt > since && 
               activity.created_by !== currentUserId && 
               !this.notificationHistory.has(notificationId);
      });

      for (const activity of newActivities) {
        const notificationId = `activity_${activity._id}`;
        await this.notifyPartnerActivity('activity', activity);
        this.notificationHistory.add(notificationId);
      }
    } catch (error) {
      console.error('Erreur vérification activités:', error);
    }
  }

  // Vérifier les nouveaux restaurants
  async checkNewRestaurants(currentUserId, since) {
    try {
      const { restaurantService } = await import('./authService');
      const restaurants = await restaurantService.getAll();
      
      const newRestaurants = restaurants.filter(restaurant => {
        const createdAt = new Date(restaurant.created_at);
        const notificationId = `restaurant_${restaurant._id}`;
        
        return createdAt > since && 
               restaurant.created_by !== currentUserId && 
               !this.notificationHistory.has(notificationId);
      });

      for (const restaurant of newRestaurants) {
        const notificationId = `restaurant_${restaurant._id}`;
        await this.notifyPartnerActivity('restaurant', restaurant);
        this.notificationHistory.add(notificationId);
      }
    } catch (error) {
      console.error('Erreur vérification restaurants:', error);
    }
  }

  // Envoyer la notification selon le type d'activité
  async notifyPartnerActivity(type, data) {
    if (!notificationService.isEnabled()) return;

    let title, body, url;

    switch (type) {
      case 'reminder':
        title = '📝 Nouveau rappel';
        body = `Ton/ta partenaire a ajouté: "${data.title}"`;
        url = '/rappels';
        break;
        
      case 'wishlist':
        title = '🎁 Nouvel item wishlist';
        body = `Ton/ta partenaire veut: "${data.title}"`;
        url = '/wishlist';
        break;
        
      case 'activity':
        title = '🎯 Nouvelle activité';
        body = `Ton/ta partenaire a ajouté: "${data.title}"`;
        url = '/activites';
        break;
        
      case 'restaurant':
        title = '🍽️ Nouveau restaurant';
        body = `Ton/ta partenaire a ajouté: "${data.name}"`;
        url = '/restaurants';
        break;
        
      default:
        return;
    }

    const options = {
      body,
      icon: '/favicon.ico',
      data: {
        type: `partner_${type}`,
        itemId: data._id,
        url
      },
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'OK',
          icon: '/favicon.ico'
        }
      ],
      requireInteraction: false,
      vibrate: [100, 50, 100]
    };

    await notificationService.showNotification(title, options);
  }

  // Forcer une vérification immédiate (à appeler après création d'un item)
  async triggerImmediateCheck() {
    if (this.isPolling) {
      await this.checkForNewActivity();
    }
  }

  // Obtenir le statut du service
  getStatus() {
    return {
      isPolling: this.isPolling,
      lastChecked: this.lastChecked,
      notificationHistory: this.notificationHistory.size,
      isNotificationEnabled: notificationService.isEnabled()
    };
  }
}

// Instance singleton
const crossNotificationService = new CrossNotificationService();

export default crossNotificationService;