const moment = require('moment');

/**
 * Calculate dynamic price based on various factors
 * @param {number} basePrice - Base price for the trip
 * @param {Object} factors - Pricing factors
 * @returns {Object} Price details
 */
const calculateDynamicPrice = (basePrice, factors = {}) => {
  let finalPrice = basePrice;
  const multipliers = {};

  // Time of day multiplier
  const hour = moment().hour();
  if (hour >= 6 && hour <= 9) {
    // Morning peak
    multipliers.timeOfDay = 1.3;
  } else if (hour >= 16 && hour <= 19) {
    // Evening peak
    multipliers.timeOfDay = 1.2;
  } else if (hour >= 23 || hour <= 4) {
    // Night hours
    multipliers.timeOfDay = 1.15;
  } else {
    multipliers.timeOfDay = 1;
  }

  // Demand multiplier
  multipliers.demand = factors.demand
    ? {
        low: 0.9,
        normal: 1,
        high: 1.2,
        surge: 1.5,
      }[factors.demand]
    : 1;

  // Season multiplier
  multipliers.season = factors.season
    ? {
        normal: 1,
        hajj: 1.4,
        umrah: 1.2,
        ramadan: 1.3,
      }[factors.season]
    : 1;

  // Special event multiplier
  multipliers.event = factors.specialEvent ? 1.25 : 1;

  // Apply all multipliers
  Object.values(multipliers).forEach((multiplier) => {
    finalPrice *= multiplier;
  });

  // Round to 2 decimal places
  finalPrice = Math.round(finalPrice * 100) / 100;

  return {
    originalPrice: basePrice,
    finalPrice,
    multipliers,
    breakdown: {
      timeOfDay: basePrice * multipliers.timeOfDay,
      demand: basePrice * multipliers.demand,
      season: basePrice * multipliers.season,
      event: basePrice * multipliers.event,
    },
  };
};

module.exports = calculateDynamicPrice;
