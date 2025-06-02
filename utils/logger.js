const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Set log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Create format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define file locations
const logDir = 'logs';
const errorLog = path.join(logDir, 'error.log');
const combinedLog = path.join(logDir, 'combined.log');

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports: [
    new winston.transports.File({
      filename: errorLog,
      level: 'error',
    }),
    new winston.transports.File({
      filename: combinedLog,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        format,
      ),
    }),
  ],
});

module.exports = logger;
