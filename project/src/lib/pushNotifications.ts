export interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

class PushNotificationService {
  async init() {
    console.log('Push notifications initialized (mock mode)');
  }

  async showNotification(options: NotificationOptions) {
    console.log('Showing notification:', options.title);
    if (Notification.permission === 'granted') {
      new Notification(options.title, { body: options.message });
    }
  }

  async sendNotification(userId: string, options: NotificationOptions) {
    console.log('Sending notification to user:', userId, options.title);
    await this.showNotification(options);
  }

  async markAsRead(notificationId: string) {
    console.log('Marking notification as read:', notificationId);
  }

  async getNotifications(userId: string, limit: number = 50) {
    return [];
  }

  async sendBroadcast(title: string, message: string) {
    console.log('Broadcasting:', title, message);
    return 0;
  }

  async unsubscribe() {
    console.log('Unsubscribed from notifications');
  }
}

export const pushNotificationService = new PushNotificationService();
