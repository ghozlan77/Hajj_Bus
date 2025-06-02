const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bus',
      required: [true, 'Sensor must be associated with a bus'],
    },
    type: {
      type: String,
      required: [true, 'Sensor type is required'],
      enum: [
        'temperature',
        'humidity',
        'fuel',
        'speed',
        'location',
        'tire_pressure',
        'engine',
        'brake',
        'door',
        'passenger_count',
      ],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'error'],
      default: 'active',
    },
    currentValue: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Current value is required'],
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
      },
    },
    threshold: {
      min: Number,
      max: Number,
      critical_min: Number,
      critical_max: Number,
    },
    lastCalibration: {
      date: Date,
      by: String,
      notes: String,
    },
    maintenanceHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          enum: ['calibration', 'repair', 'replacement', 'inspection'],
        },
        description: String,
        technician: String,
        result: {
          type: String,
          enum: ['success', 'failed', 'pending'],
        },
      },
    ],
    readings: [
      {
        value: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['normal', 'warning', 'critical'],
        },
      },
    ],
    alertSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      warningThreshold: Number,
      criticalThreshold: Number,
      notificationChannels: [
        {
          type: String,
          enum: ['email', 'sms', 'push', 'system'],
        },
      ],
    },
    metadata: {
      manufacturer: String,
      model: String,
      serialNumber: String,
      installationDate: Date,
      warrantyExpiry: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
sensorSchema.index({ bus: 1, type: 1 });
sensorSchema.index({ location: '2dsphere' });

// Virtual for sensor age
sensorSchema.virtual('age').get(function () {
  return Math.floor(
    (Date.now() - this.metadata.installationDate) / (1000 * 60 * 60 * 24),
  );
});

// Method to check if sensor needs calibration (every 6 months)
sensorSchema.methods.needsCalibration = function () {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return !this.lastCalibration.date || this.lastCalibration.date < sixMonthsAgo;
};

// Method to add new reading
sensorSchema.methods.addReading = function (value) {
  const status = this.determineReadingStatus(value);
  this.currentValue = value;
  this.readings.push({ value, status });

  if (this.readings.length > 1000) {
    this.readings.shift(); // Keep only latest 1000 readings
  }

  return status;
};

// Helper method to determine reading status
sensorSchema.methods.determineReadingStatus = function (value) {
  if (!this.threshold) return 'normal';

  if (
    value <= this.threshold.critical_min ||
    value >= this.threshold.critical_max
  ) {
    return 'critical';
  }
  if (value <= this.threshold.min || value >= this.threshold.max) {
    return 'warning';
  }
  return 'normal';
};

// Static method to find sensors needing maintenance
sensorSchema.statics.findSensorsNeedingCalibration = function () {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return this.find({
    $or: [
      { 'lastCalibration.date': { $lt: sixMonthsAgo } },
      { 'lastCalibration.date': { $exists: false } },
    ],
  });
};

const Sensor = mongoose.model('Sensor', sensorSchema);

module.exports = Sensor;
