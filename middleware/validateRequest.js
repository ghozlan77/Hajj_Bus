const Joi = require('joi');
const AppError = require('../utils/appError');

// Validation schemas
const schemas = {
  // User validation schemas
  createUser: Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    role: Joi.string().valid('user', 'driver', 'supervisor', 'admin'),
  }),

  // Bus validation schemas
  createBus: Joi.object({
    busNumber: Joi.string().required(),
    capacity: Joi.number().required().min(1),
    features: Joi.array().items(Joi.string()),
    currentLocation: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }),
  }),

  // Trip validation schemas
  createTrip: Joi.object({
    bus: Joi.string().required(),
    driver: Joi.string().required(),
    startStation: Joi.string().required(),
    endStation: Joi.string().required(),
    scheduledDeparture: Joi.date().required(),
    scheduledArrival: Joi.date().required(),
    price: Joi.number().required().min(0),
  }),

  // Sensor validation schemas
  createSensor: Joi.object({
    bus: Joi.string().required(),
    type: Joi.string().required(),
    unit: Joi.string().required(),
    thresholds: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
    }),
  }),

  // Seat validation schemas
  createSeat: Joi.object({
    bus: Joi.string().required(),
    seatNumber: Joi.string().required(),
    type: Joi.string().valid('regular', 'premium', 'accessible'),
    floor: Joi.number().integer().min(1),
    price: Joi.number().min(0),
  }),

  // Station validation schemas
  createStation: Joi.object({
    name: Joi.string().required(),
    location: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }),
    facilities: Joi.array().items(Joi.string()),
  }),

  // Hajj request validation schemas
  createRequest: Joi.object({
    pilgrim: Joi.string().required(),
    pickupLocation: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }),
    destination: Joi.string().required(),
    requestedTime: Joi.date().required(),
    passengers: Joi.number().integer().min(1),
  }),
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(
        new AppError(`Validation error: ${errorMessages.join(', ')}`, 400),
      );
    }

    next();
  };
};

module.exports = {
  validate,
  schemas,
};
