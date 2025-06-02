const { NOTIFICATION_EVENTS } = require('../constants/eventTypes');
const logger = require('../utils/logger');

class NotificationService {
  constructor(io) {
    this.io = io;
    this.notifications = new Map();
    this.subscriptions = new Map();
  }

  // Send notification to specific users
  async sendNotification(notification) {
    const {
      type,
      message,
      recipients,
      priority = 'normal',
      data = {},
    } = notification;

    const notificationObject = {
      type,
      message,
      priority,
      data,
      timestamp: new Date(),
    };

    // Store notification
    if (!this.notifications.has(type)) {
      this.notifications.set(type, []);
    }
    this.notifications.get(type).push(notificationObject);

    // Send to specific recipients
    recipients.forEach((recipientId) => {
      this.io
        .to(`user:${recipientId}`)
        .emit(NOTIFICATION_EVENTS.GENERAL, notificationObject);
    });

    // Log high priority notifications
    if (priority === 'high') {
      logger.info('High priority notification sent:', notificationObject);
    }

    return notificationObject;
  }

  // Broadcast notification to all subscribers of a type
  async broadcastNotification(type, message, data = {}) {
    const notification = {
      type,
      message,
      data,
      timestamp: new Date(),
    };

    // Get all subscribers for this type
    const subscribers = this.subscriptions.get(type) || new Set();

    // Broadcast to subscribers
    subscribers.forEach((userId) => {
      this.io
        .to(`user:${userId}`)
        .emit(NOTIFICATION_EVENTS.BROADCAST, notification);
    });

    return notification;
  }

  // Subscribe user to notification type
  subscribe(userId, notificationType) {
    if (!this.subscriptions.has(notificationType)) {
      this.subscriptions.set(notificationType, new Set());
    }
    this.subscriptions.get(notificationType).add(userId);
  }

  // Unsubscribe user from notification type
  unsubscribe(userId, notificationType) {
    const subscribers = this.subscriptions.get(notificationType);
    if (subscribers) {
      subscribers.delete(userId);
    }
  }

  // Get user's notifications
  getUserNotifications(userId, type = null) {
    if (type) {
      return this.notifications.get(type) || [];
    }

    // Get all notifications for user
    const allNotifications = [];
    this.notifications.forEach((typeNotifications) => {
      allNotifications.push(...typeNotifications);
    });

    return allNotifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear old notifications
  clearOldNotifications(maxAge = 30 * 24 * 60 * 60 * 1000) {
    const now = new Date();
    this.notifications.forEach((notifications, type) => {
      const filtered = notifications.filter((n) => now - n.timestamp <= maxAge);
      this.notifications.set(type, filtered);
    });
  }
}

module.exports = NotificationService;
