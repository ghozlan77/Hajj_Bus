const Sensor = require('../models/Sensor');
const Bus = require('../models/busModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all sensors
exports.getAllSensors = catchAsync(async (req, res, next) => {
  const sensors = await Sensor.find()
    .populate('bus', 'busNumber')
    .select('-readings');

  res.status(200).json({
    status: 'success',
    results: sensors.length,
    data: { sensors },
  });
});

// Get single sensor
exports.getSensor = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id).populate('bus');

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { sensor },
  });
});

// Create new sensor
exports.createSensor = catchAsync(async (req, res, next) => {
  // Check if bus exists
  const bus = await Bus.findById(req.body.bus);
  if (!bus) {
    return next(new AppError('No bus found with that ID', 404));
  }

  const sensor = await Sensor.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { sensor },
  });
});

// Update sensor
exports.updateSensor = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { sensor },
  });
});

// Delete sensor
exports.deleteSensor = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findByIdAndDelete(req.params.id);

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add sensor reading
exports.addSensorReading = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  const status = sensor.addReading(req.body.value);
  await sensor.save();

  res.status(200).json({
    status: 'success',
    data: {
      currentValue: req.body.value,
      readingStatus: status,
    },
  });
});

// Get sensor readings
exports.getSensorReadings = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      readings: sensor.readings,
    },
  });
});

// Add maintenance record
exports.addMaintenanceRecord = catchAsync(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  sensor.maintenanceHistory.push({
    date: new Date(),
    type: req.body.type,
    description: req.body.description,
    technician: req.body.technician,
    result: req.body.result,
  });

  if (req.body.type === 'calibration') {
    sensor.lastCalibration = {
      date: new Date(),
      by: req.body.technician,
      notes: req.body.description,
    };
  }

  await sensor.save();

  res.status(200).json({
    status: 'success',
    data: { sensor },
  });
});

// Get sensors needing calibration
exports.getSensorsNeedingCalibration = catchAsync(async (req, res, next) => {
  const sensors = await Sensor.findSensorsNeedingCalibration().populate(
    'bus',
    'busNumber',
  );

  res.status(200).json({
    status: 'success',
    results: sensors.length,
    data: { sensors },
  });
});

// Update sensor status
exports.updateSensorStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['active', 'inactive', 'maintenance', 'error'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid sensor status', 400));
  }

  const sensor = await Sensor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!sensor) {
    return next(new AppError('No sensor found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { sensor },
  });
});

// Get sensors by type
exports.getSensorsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;

  const sensors = await Sensor.find({ type })
    .populate('bus', 'busNumber')
    .select('-readings');

  res.status(200).json({
    status: 'success',
    results: sensors.length,
    data: { sensors },
  });
});
