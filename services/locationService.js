const { BUS_EVENTS } = require('../constants/eventTypes');
const logger = require('../utils/logger');
const calculateETA = require('../utils/calculateETA');
const findNearestBus = require('../utils/findNearestBus');

class LocationService {
  constructor() {
    this.busLocations = new Map(); // Store current bus locations
    this.locationHistory = new Map(); // Store location history for each bus
  }

  // Update bus location
  updateBusLocation(busId, locationData) {
    const timestamp = new Date();
    const location = {
      ...locationData,
      timestamp,
    };

    // Update current location
    this.busLocations.set(busId, location);

    // Update location history
    if (!this.locationHistory.has(busId)) {
      this.locationHistory.set(busId, []);
    }
    const history = this.locationHistory.get(busId);
    history.push(location);

    // Keep only last 24 hours of history
    const oneDayAgo = new Date(timestamp - 24 * 60 * 60 * 1000);
    this.locationHistory.set(
      busId,
      history.filter((loc) => loc.timestamp > oneDayAgo),
    );

    return location;
  }

  // Get current bus location
  getBusLocation(busId) {
    return this.busLocations.get(busId);
  }

  // Get bus location history
  getBusLocationHistory(busId, startTime, endTime) {
    const history = this.locationHistory.get(busId) || [];
    return history.filter(
      (loc) => loc.timestamp >= startTime && loc.timestamp <= endTime,
    );
  }

  // Calculate ETA to destination
  async calculateBusETA(busId, destination) {
    const currentLocation = this.busLocations.get(busId);
    if (!currentLocation) {
      throw new Error('Bus location not found');
    }

    return calculateETA(currentLocation, destination);
  }

  // Find nearest bus to a location
  findNearestBusToLocation(location, maxDistance = 5000) {
    const busLocations = Array.from(this.busLocations.entries()).map(
      ([busId, loc]) => ({ busId, ...loc }),
    );
    return findNearestBus(location, busLocations, maxDistance);
  }

  // Clear old location data
  clearOldLocationData(maxAge = 24 * 60 * 60 * 1000) {
    const now = new Date();
    this.locationHistory.forEach((history, busId) => {
      const filteredHistory = history.filter(
        (loc) => now - loc.timestamp <= maxAge,
      );
      this.locationHistory.set(busId, filteredHistory);
    });
  }
}

module.exports = LocationService;
