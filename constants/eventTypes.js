// Bus Events
const BUS_EVENTS = {
  LOCATION_UPDATE: 'busLocationUpdate',
  LOCATION_BROADCAST: 'busLocationBroadcast',
  STATUS_UPDATE: 'busStatusUpdate',
  STATUS_BROADCAST: 'busStatusBroadcast',
  MAINTENANCE_ALERT: 'busMaintenanceAlert',
  FUEL_ALERT: 'busFuelAlert',
  SPEED_ALERT: 'busSpeedAlert',
  ARRIVED: 'busArrived',
  DEPARTED: 'busDeparted',
  JOIN_ROOM: 'joinBusRoom',
  LEAVE_ROOM: 'leaveBusRoom',
};

// Trip Events
const TRIP_EVENTS = {
  STATUS_UPDATE: 'tripStatusUpdate',
  STATUS_BROADCAST: 'tripStatusBroadcast',
  DELAY_ALERT: 'tripDelayAlert',
  SCHEDULE_UPDATE: 'tripScheduleUpdate',
  PASSENGER_UPDATE: 'tripPassengerUpdate',
  ROUTE_DEVIATION: 'tripRouteDeviation',
  COMPLETED: 'tripCompleted',
  CANCELLED: 'tripCancelled',
};

// Seat Events
const SEAT_EVENTS = {
  STATUS_UPDATE: 'seatStatusUpdate',
  STATUS_BROADCAST: 'seatStatusBroadcast',
  RESERVATION_UPDATE: 'seatReservationUpdate',
  AVAILABILITY_CHANGE: 'seatAvailabilityChange',
  MAINTENANCE_NEEDED: 'seatMaintenanceNeeded',
};

// Sensor Events
const SENSOR_EVENTS = {
  DATA_UPDATE: 'sensorDataUpdate',
  DATA_BROADCAST: 'sensorDataBroadcast',
  THRESHOLD_ALERT: 'sensorThresholdAlert',
  MALFUNCTION: 'sensorMalfunction',
  CALIBRATION_NEEDED: 'sensorCalibrationNeeded',
};

// Emergency Events
const EMERGENCY_EVENTS = {
  ALERT: 'emergencyAlert',
  BROADCAST: 'emergencyBroadcast',
  RESPONSE_NEEDED: 'emergencyResponseNeeded',
  RESOLVED: 'emergencyResolved',
};

// System Events
const SYSTEM_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MAINTENANCE_MODE: 'maintenanceMode',
  SYSTEM_ALERT: 'systemAlert',
};

// Notification Events
const NOTIFICATION_EVENTS = {
  GENERAL: 'notification',
  ALERT: 'notificationAlert',
  UPDATE: 'notificationUpdate',
  BROADCAST: 'notificationBroadcast',
};

module.exports = {
  BUS_EVENTS,
  TRIP_EVENTS,
  SEAT_EVENTS,
  SENSOR_EVENTS,
  EMERGENCY_EVENTS,
  SYSTEM_EVENTS,
  NOTIFICATION_EVENTS,
};
