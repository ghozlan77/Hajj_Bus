const { SENSOR_EVENTS } = require('../constants/eventTypes');
const logger = require('../utils/logger');
const MonitoringService = require('../services/monitoringService');
const NotificationService = require('../services/notificationService');

class SensorEventHandler {
  constructor(io, monitoringService, notificationService) {
    this.io = io;
    this.monitoringService = monitoringService || new MonitoringService();
    this.notificationService =
      notificationService || new NotificationService(io);
  }

  // Handle sensor data updates
  async handleDataUpdate(socket, data) {
    try {
      const { sensorId, busId, type, value, unit, timestamp } = data;

      // Broadcast sensor data
      socket.to(`bus:${busId}`).emit(SENSOR_EVENTS.DATA_BROADCAST, data);

      // Record metric
      this.monitoringService.recordMetric(`sensor.${type}`, {
        value,
        unit,
        sensorId,
        busId,
        timestamp,
      });

      return { success: true, data };
    } catch (error) {
      logger.error('Error handling sensor data update:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle threshold alerts
  async handleThresholdAlert(socket, data) {
    try {
      const { sensorId, busId, type, value, threshold, severity } = data;

      // Broadcast threshold alert
      socket.to(`bus:${busId}`).emit(SENSOR_EVENTS.THRESHOLD_ALERT, data);

      // Send notification for critical thresholds
      if (severity === 'critical') {
        await this.notificationService.sendNotification({
          type: 'sensor_alert',
          message: `Critical sensor alert for bus ${busId}: ${type} value ${value} exceeded threshold`,
          priority: 'high',
          recipients: ['maintenance_team', 'supervisor'],
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling threshold alert:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle sensor malfunction
  async handleMalfunction(socket, data) {
    try {
      const { sensorId, busId, type, error: sensorError } = data;

      // Broadcast malfunction
      socket.to(`bus:${busId}`).emit(SENSOR_EVENTS.MALFUNCTION, data);

      // Send notification
      await this.notificationService.sendNotification({
        type: 'sensor_malfunction',
        message: `Sensor malfunction on bus ${busId}: ${type} - ${sensorError}`,
        priority: 'high',
        recipients: ['maintenance_team'],
      });

      return { success: true };
    } catch (error) {
      logger.error('Error handling sensor malfunction:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle calibration needs
  async handleCalibrationNeeded(socket, data) {
    try {
      const { sensorId, busId, type, lastCalibration } = data;

      // Broadcast calibration needed
      socket.to(`bus:${busId}`).emit(SENSOR_EVENTS.CALIBRATION_NEEDED, data);

      // Send notification
      await this.notificationService.sendNotification({
        type: 'sensor_calibration',
        message: `Sensor calibration needed for bus ${busId}: ${type}`,
        priority: 'normal',
        recipients: ['maintenance_team'],
        data: { lastCalibration },
      });

      return { success: true };
    } catch (error) {
      logger.error('Error handling calibration needed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SensorEventHandler;
