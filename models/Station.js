const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      unique: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'Station coordinates are required'],
      },
    },
    address: {
      type: String,
      required: [true, 'Station address is required'],
      trim: true,
    },
    currentCapacity: {
      type: Number,
      default: 0,
      min: [0, 'Current capacity cannot be less than 0'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be greater than 0'],
    },
    capacityStatus: {
      type: String,
      enum: ['available', 'full'],
      default: 'available',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'closed'],
      default: 'active',
    },
    buses: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Bus',
      },
    ],
    operatingHours: {
      open: {
        type: String,
        default: '00:00',
      },
      close: {
        type: String,
        default: '23:59',
      },
    },
    facilities: [
      {
        type: String,
        enum: [
          'parking',
          'waiting_area',
          'restrooms',
          'prayer_room',
          'cafeteria',
        ],
      },
    ],
    contactInfo: {
      phone: String,
      email: String,
      emergencyNumber: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create geospatial index for location
stationSchema.index({ location: '2dsphere' });

// Check capacity before saving
stationSchema.pre('save', function (next) {
  if (this.currentCapacity > this.maxCapacity) {
    this.currentCapacity = this.maxCapacity;
  }
  this.capacityStatus =
    this.currentCapacity >= this.maxCapacity ? 'full' : 'available';
  next();
});

// Calculate occupancy rate
stationSchema.virtual('occupancyRate').get(function () {
  return (this.currentCapacity / this.maxCapacity) * 100;
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
