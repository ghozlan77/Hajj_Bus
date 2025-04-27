const express = require('express');
 const mongoose = require('mongoose');
 const morgan = require('morgan');
 const dotenv = require('dotenv');
 
 const userRoutes = require('./routes/userRouts');
 const busRoutes = require('./routes/busRoutes');
 const hajjRequestRoutes = require('./routes/hajjRequestsRoutes');
 
 const app = express();
 
 app.use(express.json());
 
 if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
 }
 
 app.use('/api/v1/buses', busRoutes);
 app.use('/api/vi/requests', hajjRequestRoutes);
 app.use('/api/v1/users', userRoutes);
 
 module.exports = app;
 