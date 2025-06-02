const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Connect to DB
connectDB();

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/seats', require('./routes/seatRoutes'));
app.use('/api/requests', require('./routes/hajjRequestRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/sensors', require('./routes/sensorRoutes'));

// Handle 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
