const Seat = require('../models/Seat');
const Bus = require('../models/busModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all seats
exports.getAllSeats = catchAsync(async (req, res, next) => {
  const seats = await Seat.find()
    .populate('bus', 'busNumber')
    .populate('currentPassenger', 'name');

  res.status(200).json({
    status: 'success',
    results: seats.length,
    data: { seats },
  });
});

// Get single seat
exports.getSeat = catchAsync(async (req, res, next) => {
  const seat = await Seat.findById(req.params.id)
    .populate('bus')
    .populate('currentPassenger')
    .populate('bookingHistory');

  if (!seat) {
    return next(new AppError('No seat found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { seat },
  });
});

// Create new seat
exports.createSeat = catchAsync(async (req, res, next) => {
  // Check if bus exists
  const bus = await Bus.findById(req.body.bus);
  if (!bus) {
    return next(new AppError('No bus found with that ID', 404));
  }

  const seat = await Seat.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { seat },
  });
});

// Update seat
exports.updateSeat = catchAsync(async (req, res, next) => {
  const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!seat) {
    return next(new AppError('No seat found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { seat },
  });
});

// Delete seat
exports.deleteSeat = catchAsync(async (req, res, next) => {
  const seat = await Seat.findByIdAndDelete(req.params.id);

  if (!seat) {
    return next(new AppError('No seat found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get available seats in a bus
exports.getAvailableSeats = catchAsync(async (req, res, next) => {
  const { busId } = req.params;

  const seats = await Seat.findAvailableSeats(busId);

  res.status(200).json({
    status: 'success',
    results: seats.length,
    data: { seats },
  });
});

// Update seat status
exports.updateSeatStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = [
    'available',
    'booked',
    'occupied',
    'maintenance',
    'reserved',
  ];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid seat status', 400));
  }

  const seat = await Seat.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!seat) {
    return next(new AppError('No seat found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { seat },
  });
});

// Add maintenance record
exports.addMaintenanceRecord = catchAsync(async (req, res, next) => {
  const seat = await Seat.findById(req.params.id);

  if (!seat) {
    return next(new AppError('No seat found with that ID', 404));
  }

  seat.maintenanceHistory.push({
    date: new Date(),
    type: req.body.type,
    description: req.body.description,
    technician: req.body.technician,
  });

  seat.lastMaintenance = new Date();
  seat.nextMaintenance = new Date(
    new Date().setMonth(new Date().getMonth() + 3),
  );
  seat.seatCondition = req.body.seatCondition || 'excellent';

  await seat.save();

  res.status(200).json({
    status: 'success',
    data: { seat },
  });
});

// Get seats needing maintenance
exports.getSeatsNeedingMaintenance = catchAsync(async (req, res, next) => {
  const seats = await Seat.find().select('+nextMaintenance +seatCondition');
  const seatsNeedingMaintenance = seats.filter((seat) =>
    seat.needsMaintenance(),
  );

  res.status(200).json({
    status: 'success',
    results: seatsNeedingMaintenance.length,
    data: { seats: seatsNeedingMaintenance },
  });
});
