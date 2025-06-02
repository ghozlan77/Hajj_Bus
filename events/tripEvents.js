const { TRIP_EVENTS } = require('../constants/eventTypes');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');
const LocationService = require('../services/locationService');

class TripEventHandler {
  constructor(io, locationService, notificationService) {
    this.io = io;
    this.locationService = locationService || new LocationService();
    this.notificationService =
      notificationService || new NotificationService(io);
  }

  // Handle trip status updates
  async handleStatusUpdate(socket, data) {
    try {
      const { tripId, status, reason } = data;

      // Broadcast status update
      socket.to(`trip:${tripId}`).emit(TRIP_EVENTS.STATUS_BROADCAST, data);

      // Send notifications for important status changes
      if (['delayed', 'cancelled', 'completed'].includes(status)) {
        await this.notificationService.broadcastNotification(
          'trip_status',
          `Trip ${tripId} status changed to ${status}${reason ? `: ${reason}` : ''}`,
          data,
        );
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling trip status update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle trip delays
  async handleDelayAlert(socket, data) {
    try {
      const { tripId, delay, reason } = data;

      // Broadcast delay alert
      socket.to(`trip:${tripId}`).emit(TRIP_EVENTS.DELAY_ALERT, data);

      // Notify passengers
      await this.notificationService.broadcastNotification(
        'trip_delay',
        `Trip ${tripId} is delayed by ${delay} minutes${reason ? `: ${reason}` : ''}`,
        data,
      );

      return { success: true };
    } catch (error) {
      logger.error('Error handling trip delay:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle schedule updates
  async handleScheduleUpdate(socket, data) {
    try {
      const { tripId, schedule, changes } = data;

      // Broadcast schedule update
      socket.to(`trip:${tripId}`).emit(TRIP_EVENTS.SCHEDULE_UPDATE, data);

      // Notify affected passengers
      await this.notificationService.broadcastNotification(
        'schedule_change',
        `Schedule updated for trip ${tripId}`,
        { tripId, changes },
      );

      return { success: true };
    } catch (error) {
      logger.error('Error handling schedule update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle passenger updates
  async handlePassengerUpdate(socket, data) {
    try {
      const { tripId, passengerCount, capacity } = data;

      // Broadcast passenger update
      socket.to(`trip:${tripId}`).emit(TRIP_EVENTS.PASSENGER_UPDATE, data);

      // Notify if bus is near capacity
      if (passengerCount >= capacity * 0.9) {
        await this.notificationService.sendNotification({
          type: 'capacity_alert',
          message: `Trip ${tripId} is nearing capacity`,
          priority: 'normal',
          recipients: ['supervisor'],
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling passenger update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle route deviations
  async handleRouteDeviation(socket, data) {
    try {
      const { tripId, deviation, reason } = data;

      // Broadcast route deviation
      socket.to(`trip:${tripId}`).emit(TRIP_EVENTS.ROUTE_DEVIATION, data);

      // Send notification
      await this.notificationService.broadcastNotification(
        'route_deviation',
        `Trip ${tripId} has deviated from planned route${reason ? `: ${reason}` : ''}`,
        data,
      );

      return { success: true };
    } catch (error) {
      logger.error('Error handling route deviation:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TripEventHandler;
