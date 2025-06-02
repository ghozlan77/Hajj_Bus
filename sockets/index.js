module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(` New client connected: ${socket.id}`);

    // location bus
    socket.on('busLocationUpdate', (data) => {
      console.log(' Location Update:', data);
      io.emit('busLocationBroadcast', data);
    });

    //  seat status
    socket.on('seatStatusUpdate', (data) => {
      console.log('💺 Seat Status Update:', data);
      io.emit('seatStatusBroadcast', data);
    });

    // bus notification
    socket.on('busArrived', (data) => {
      console.log('🛬 Bus Arrived:', data);
      io.emit('busArrivedNotification', data);
    });

    // disconnected
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
