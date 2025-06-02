const { BUS_EVENTS } = require('../constants/eventTypes');
const logger = require('../utils/logger');
const LocationService = require('../services/locationService');
const MonitoringService = require('../services/monitoringService');
const NotificationService = require('../services/notificationService');

class BusEventHandler {
  constructor(io, locationService, monitoringService, notificationService) {
    this.io = io;
    this.locationService = locationService || new LocationService();
    this.monitoringService = monitoringService || new MonitoringService();
    this.notificationService =
      notificationService || new NotificationService(io);
  }

  // Handle bus location updates
  async handleLocationUpdate(socket, data) {
    try {
      const location = this.locationService.updateBusLocation(
        data.busId,
        data.location,
      );

      // Broadcast to relevant subscribers
      socket
        .to(`bus:${data.busId}`)
        .emit(BUS_EVENTS.LOCATION_BROADCAST, location);

      // Record metric
      this.monitoringService.recordMetric('bus.location.update', {
        busId: data.busId,
        timestamp: new Date(),
      });

      return { success: true, data: location };
    } catch (error) {
      logger.error('Error handling bus location update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle bus status updates
  async handleStatusUpdate(socket, data) {
    try {
      // Update bus status and notify relevant parties
      socket.to(`bus:${data.busId}`).emit(BUS_EVENTS.STATUS_BROADCAST, data);

      // Send notifications for important status changes
      if (data.status === 'maintenance_needed' || data.status === 'emergency') {
        await this.notificationService.sendNotification({
          type: 'bus_status',
          message: `Bus ${data.busId} status changed to ${data.status}`,
          priority: data.status === 'emergency' ? 'high' : 'normal',
          recipients: ['admin', 'supervisor'],
        });
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Error handling bus status update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle bus arrival events
  async handleBusArrival(socket, data) {
    try {
      const { busId, stationId, tripId } = data;

      // Broadcast arrival
      socket.to(`trip:${tripId}`).emit(BUS_EVENTS.ARRIVED, data);

      // Notify passengers
      await this.notificationService.broadcastNotification(
        'bus_arrival',
        `Bus has arrived at station ${stationId}`,
        { busId, stationId, tripId },
      );

      return { success: true };
    } catch (error) {
      logger.error('Error handling bus arrival:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle bus departure events
  async handleBusDeparture(socket, data) {
    try {
      const { busId, stationId, tripId, nextStationId, estimatedArrival } =
        data;

      // Broadcast departure
      socket.to(`trip:${tripId}`).emit(BUS_EVENTS.DEPARTED, data);

      // Notify passengers about departure and ETA
      await this.notificationService.broadcastNotification(
        'bus_departure',
        `Bus has departed from station ${stationId}`,
        { busId, tripId, nextStationId, estimatedArrival },
      );

      return { success: true };
    } catch (error) {
      logger.error('Error handling bus departure:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle maintenance alerts
  async handleMaintenanceAlert(socket, data) {
    try {
      const { busId, issue, severity } = data;

      // Broadcast maintenance alert
      socket.to('maintenance').emit(BUS_EVENTS.MAINTENANCE_ALERT, data);

      // Send high-priority notification for severe issues
      if (severity === 'high') {
        await this.notificationService.sendNotification({
          type: 'maintenance_alert',
          message: `Urgent maintenance required for bus ${busId}: ${issue}`,
          priority: 'high',
          recipients: ['maintenance_team', 'supervisor'],
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling maintenance alert:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = BusEventHandler;
