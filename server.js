const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const socketService = require('./services/socketService');

dotenv.config({ path: './config.env' });

const app = require('./app');
const server = http.createServer(app);
const io = socketIo(server);

connectDB();

// Socket.IO setup
socketService.initialize(io);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle shutdown signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
