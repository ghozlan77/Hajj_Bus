const haversine = require('haversine');
const Bus = require('../models/busModel');

/**
 * Find nearest available buses based on location and requirements
 * @param {Object} location - Current location { latitude, longitude }
 * @param {Object} requirements - Bus requirements
 * @returns {Promise<Array>} Sorted array of nearest available buses
 */
const findNearestBuses = async (location, requirements = {}) => {
  try {
    // Find all available buses
    const buses = await Bus.find({
      status: 'available',
      ...requirements,
    }).populate('driver');

    // Calculate distance for each bus
    const busesWithDistance = buses.map((bus) => {
      const distance = haversine(
        location,
        {
          latitude: bus.currentLocation.coordinates[1],
          longitude: bus.currentLocation.coordinates[0],
        },
        { unit: 'km' },
      );

      return {
        bus,
        distance,
        estimatedArrival: Math.round((distance / 50) * 60), // Rough ETA in minutes
      };
    });

    // Sort by distance
    busesWithDistance.sort((a, b) => a.distance - b.distance);

    // Add rank and format response
    return busesWithDistance.map((item, index) => ({
      rank: index + 1,
      busId: item.bus._id,
      busNumber: item.bus.busNumber,
      driver: item.bus.driver
        ? {
            name: item.bus.driver.name,
            phone: item.bus.driver.phone,
          }
        : null,
      distance: Math.round(item.distance * 10) / 10,
      estimatedArrival: item.estimatedArrival,
      currentLocation: item.bus.currentLocation,
      capacity: item.bus.capacity,
      features: item.bus.features,
    }));
  } catch (error) {
    throw new Error(`Error finding nearest buses: ${error.message}`);
  }
};

module.exports = findNearestBuses;
