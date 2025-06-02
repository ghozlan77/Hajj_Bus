const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    number: {
      type: String,
      required: [true, 'Bus must have a number'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Bus must have a capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    sensors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor',
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['available', 'in_service', 'maintenance', 'out_of_service'],
      default: 'available',
    },
    maintenanceHistory: [
      {
        date: Date,
        type: String,
        description: String,
        technician: String,
        cost: Number,
      },
    ],
    lastMaintenance: Date,
    nextScheduledMaintenance: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create geospatial index for location
busSchema.index({ location: '2dsphere' });

// Virtual populate for current passengers
busSchema.virtual('currentPassengers', {
  ref: 'Trip',
  foreignField: 'bus',
  localField: '_id',
  match: { status: 'in_progress' },
});

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;
