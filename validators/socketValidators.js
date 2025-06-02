const Joi = require('joi');
const { CLIENT_TYPES } = require('../constants/socketConstants');

// Location update validation schema
const locationUpdateSchema = Joi.object({
  busId: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    altitude: Joi.number().optional(),
    accuracy: Joi.number().min(0).optional(),
  }).required(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional(),
  timestamp: Joi.date().iso().required(),
});

// Sensor data validation schema
const sensorDataSchema = Joi.object({
  busId: Joi.string().required(),
  sensorId: Joi.string().required(),
  type: Joi.string().required(),
  value: Joi.number().required(),
  unit: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  status: Joi.string().valid('normal', 'warning', 'critical').required(),
});

// Client authentication validation schema
const clientAuthSchema = Joi.object({
  clientId: Joi.string().required(),
  clientType: Joi.string()
    .valid(...Object.values(CLIENT_TYPES))
    .required(),
  token: Joi.string().required(),
});

// Chat message validation schema
const chatMessageSchema = Joi.object({
  senderId: Joi.string().required(),
  senderType: Joi.string()
    .valid(...Object.values(CLIENT_TYPES))
    .required(),
  receiverId: Joi.string().required(),
  receiverType: Joi.string()
    .valid(...Object.values(CLIENT_TYPES))
    .required(),
  message: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  messageType: Joi.string().valid('text', 'alert', 'status').required(),
});

// Emergency alert validation schema
const emergencyAlertSchema = Joi.object({
  busId: Joi.string().required(),
  type: Joi.string()
    .valid('medical', 'mechanical', 'security', 'other')
    .required(),
  description: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  timestamp: Joi.date().iso().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
});

// Validation middleware function
const validateSocketData = (schema) => (data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map((detail) => detail.message),
    };
  }

  return {
    isValid: true,
    data: value,
  };
};

module.exports = {
  validateLocationUpdate: validateSocketData(locationUpdateSchema),
  validateSensorData: validateSocketData(sensorDataSchema),
  validateClientAuth: validateSocketData(clientAuthSchema),
  validateChatMessage: validateSocketData(chatMessageSchema),
  validateEmergencyAlert: validateSocketData(emergencyAlertSchema),
};
