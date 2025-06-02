const {
  SOCKET_CONFIG,
  RESPONSE_STATUS,
} = require('../constants/socketConstants');
const { BUS_EVENTS, EMERGENCY_EVENTS } = require('../constants/eventTypes');
const socketValidators = require('../validators/socketValidators');
const logger = require('../utils/logger');

class SocketService {
  constructor(io) {
    this.io = io;
    this.activeConnections = new Map();
    this.rateLimiters = new Map();
  }

  // Initialize rate limiter for a client
  initRateLimiter(clientId, eventType) {
    const key = `${clientId}:${eventType}`;
    const limit = SOCKET_CONFIG.RATE_LIMITS[eventType] || 1000;

    this.rateLimiters.set(key, {
      lastUpdate: Date.now(),
      limit,
    });
  }

  // Check if action is rate limited
  isRateLimited(clientId, eventType) {
    const key = `${clientId}:${eventType}`;
    const limiter = this.rateLimiters.get(key);

    if (!limiter) {
      this.initRateLimiter(clientId, eventType);
      return false;
    }

    const now = Date.now();
    if (now - limiter.lastUpdate < limiter.limit) {
      return true;
    }

    limiter.lastUpdate = now;
    return false;
  }

  // Handle client connection
  handleConnection(socket) {
    logger.info(`New client connected: ${socket.id}`);

    this.activeConnections.set(socket.id, {
      connectedAt: new Date(),
      lastActivity: new Date(),
    });

    // Handle authentication
    socket.on('authenticate', async (data) => {
      const validation = socketValidators.validateClientAuth(data);
      if (!validation.isValid) {
        socket.emit('authResponse', {
          status: RESPONSE_STATUS.INVALID_DATA,
          errors: validation.errors,
        });
        return;
      }

      try {
        // Add client info to socket
        socket.clientId = data.clientId;
        socket.clientType = data.clientType;

        // Join appropriate rooms based on client type
        if (data.clientType === 'bus') {
          socket.join(`${SOCKET_CONFIG.ROOM_PREFIXES.BUS}${data.clientId}`);
        }

        socket.emit('authResponse', {
          status: RESPONSE_STATUS.SUCCESS,
          message: 'Authentication successful',
        });
      } catch (error) {
        logger.error('Authentication error:', error);
        socket.emit('authResponse', {
          status: RESPONSE_STATUS.SERVER_ERROR,
          message: 'Authentication failed',
        });
      }
    });

    // Handle location updates
    socket.on(BUS_EVENTS.LOCATION_UPDATE, (data) => {
      if (this.isRateLimited(socket.clientId, 'LOCATION_UPDATES')) {
        socket.emit('error', {
          status: RESPONSE_STATUS.RATE_LIMITED,
          message: 'Location updates are rate limited',
        });
        return;
      }

      const validation = socketValidators.validateLocationUpdate(data);
      if (!validation.isValid) {
        socket.emit('error', {
          status: RESPONSE_STATUS.INVALID_DATA,
          errors: validation.errors,
        });
        return;
      }

      // Broadcast location update to relevant rooms
      this.io
        .to(`${SOCKET_CONFIG.ROOM_PREFIXES.BUS}${data.busId}`)
        .emit(BUS_EVENTS.LOCATION_BROADCAST, validation.data);
    });

    // Handle emergency alerts
    socket.on(EMERGENCY_EVENTS.ALERT, (data) => {
      const validation = socketValidators.validateEmergencyAlert(data);
      if (!validation.isValid) {
        socket.emit('error', {
          status: RESPONSE_STATUS.INVALID_DATA,
          errors: validation.errors,
        });
        return;
      }

      // Broadcast emergency to all relevant parties
      this.io
        .to(SOCKET_CONFIG.CHANNELS.EMERGENCIES)
        .emit(EMERGENCY_EVENTS.BROADCAST, validation.data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      this.activeConnections.delete(socket.id);
      this.rateLimiters.delete(socket.clientId);
    });
  }

  // Get active connections count
  getActiveConnectionsCount() {
    return this.activeConnections.size;
  }

  // Clean up inactive connections
  cleanupInactiveConnections() {
    const now = new Date();
    this.activeConnections.forEach((data, socketId) => {
      if (now - data.lastActivity > SOCKET_CONFIG.PING_TIMEOUT) {
        this.io.sockets.sockets.get(socketId)?.disconnect(true);
      }
    });
  }
}

module.exports = SocketService;
