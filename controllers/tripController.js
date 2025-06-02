const Trip = require('../models/Trip');
const Bus = require('../models/busModel');
const User = require('../models/userModel');
const Station = require('../models/Station');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all trips
exports.getAllTrips = catchAsync(async (req, res, next) => {
  const trips = await Trip.find()
    .populate('bus', 'busNumber')
    .populate('driver', 'name')
    .populate('startStation endStation', 'name location')
    .select('-route -delays -weather');

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips },
  });
});

// Get single trip
exports.getTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id)
    .populate('bus')
    .populate('driver')
    .populate('startStation endStation')
    .populate('intermediateStops.station')
    .populate('passengers.user', 'name phone')
    .populate('passengers.seat');

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Create new trip
exports.createTrip = catchAsync(async (req, res, next) => {
  // Validate bus availability
  const bus = await Bus.findById(req.body.bus);
  if (!bus) {
    return next(new AppError('No bus found with that ID', 404));
  }

  // Validate driver
  const driver = await User.findById(req.body.driver);
  if (!driver || driver.role !== 'driver') {
    return next(new AppError('Invalid driver ID', 400));
  }

  // Validate stations
  const [startStation, endStation] = await Promise.all([
    Station.findById(req.body.startStation),
    Station.findById(req.body.endStation),
  ]);

  if (!startStation || !endStation) {
    return next(new AppError('Invalid station ID', 400));
  }

  const trip = await Trip.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { trip },
  });
});

// Update trip
exports.updateTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Delete trip
exports.deleteTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findByIdAndDelete(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Update trip status
exports.updateTripStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = [
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'delayed',
  ];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid trip status', 400));
  }

  const trip = await Trip.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Add delay to trip
exports.addTripDelay = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  trip.addDelay(req.body.reason, req.body.duration, req.body.location);
  await trip.save();

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Update trip location
exports.updateTripLocation = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  await trip.updateLocation(req.body.coordinates);

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Get nearby trips
exports.getNearbyTrips = catchAsync(async (req, res, next) => {
  const { coordinates, distance } = req.query;

  if (!coordinates) {
    return next(new AppError('Please provide coordinates', 400));
  }

  const [lng, lat] = coordinates.split(',').map(Number);
  const maxDistance = distance || 10000; // Default 10km

  const trips = await Trip.findNearbyTrips([lng, lat], maxDistance)
    .populate('bus', 'busNumber')
    .populate('driver', 'name')
    .select('status currentLocation scheduledArrival');

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips },
  });
});

// Add passenger to trip
exports.addPassenger = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  const { userId, seatId, specialRequests } = req.body;

  // Check if seat is already taken
  const seatTaken = trip.passengers.some(
    (p) =>
      p.seat.toString() === seatId &&
      ['booked', 'checked_in'].includes(p.status),
  );

  if (seatTaken) {
    return next(new AppError('This seat is already taken', 400));
  }

  trip.passengers.push({
    user: userId,
    seat: seatId,
    specialRequests,
    bookingReference: Math.random().toString(36).substring(2, 10).toUpperCase(),
  });

  await trip.save();

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});

// Update passenger status
exports.updatePassengerStatus = catchAsync(async (req, res, next) => {
  const { tripId, passengerId } = req.params;
  const { status } = req.body;

  if (!['booked', 'checked_in', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid passenger status', 400));
  }

  const trip = await Trip.findOneAndUpdate(
    {
      _id: tripId,
      'passengers._id': passengerId,
    },
    {
      $set: { 'passengers.$.status': status },
    },
    { new: true },
  );

  if (!trip) {
    return next(new AppError('Trip or passenger not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip },
  });
});
