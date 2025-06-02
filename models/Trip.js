const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bus',
      required: [true, 'Trip must be assigned to a bus'],
    },
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Trip must have a driver'],
    },
    startStation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Station',
      required: [true, 'Start station is required'],
    },
    endStation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Station',
      required: [true, 'End station is required'],
    },
    intermediateStops: [
      {
        station: {
          type: mongoose.Schema.ObjectId,
          ref: 'Station',
        },
        estimatedArrival: Date,
        actualArrival: Date,
        estimatedDeparture: Date,
        actualDeparture: Date,
        status: {
          type: String,
          enum: ['pending', 'arrived', 'departed', 'skipped'],
          default: 'pending',
        },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'],
      default: 'scheduled',
    },
    scheduledDeparture: {
      type: Date,
      required: [true, 'Scheduled departure time is required'],
    },
    actualDeparture: Date,
    scheduledArrival: {
      type: Date,
      required: [true, 'Scheduled arrival time is required'],
    },
    actualArrival: Date,
    route: {
      type: {
        type: String,
        enum: ['LineString'],
        default: 'LineString',
      },
      coordinates: {
        type: [[Number]],
        required: [true, 'Route coordinates are required'],
      },
    },
    distance: {
      type: Number,
      required: [true, 'Trip distance is required'],
    },
    passengers: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        seat: {
          type: mongoose.Schema.ObjectId,
          ref: 'Seat',
        },
        status: {
          type: String,
          enum: ['booked', 'checked_in', 'completed', 'cancelled'],
          default: 'booked',
        },
        bookingReference: String,
        boardingPass: String,
        specialRequests: String,
      },
    ],
    fare: {
      type: Number,
      required: [true, 'Trip fare is required'],
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Current location coordinates are required'],
      },
    },
    delays: [
      {
        reason: String,
        duration: Number, // in minutes
        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
          },
          coordinates: [Number],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    weather: {
      condition: String,
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
    },
    tripNotes: String,
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relationship: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
tripSchema.index({ bus: 1, scheduledDeparture: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ currentLocation: '2dsphere' });
tripSchema.index({ route: '2dsphere' });

// Virtual field for trip duration in hours
tripSchema.virtual('duration').get(function () {
  return (this.scheduledArrival - this.scheduledDeparture) / (1000 * 60 * 60);
});

// Virtual field for available seats
tripSchema.virtual('availableSeats').get(function () {
  return this.passengers.filter(
    (p) => p.status === 'booked' || p.status === 'checked_in',
  ).length;
});

// Virtual field for trip progress percentage
tripSchema.virtual('progress').get(function () {
  if (this.status === 'completed') return 100;
  if (this.status === 'scheduled') return 0;

  const now = new Date();
  const start = this.actualDeparture || this.scheduledDeparture;
  const end = this.scheduledArrival;
  const total = end - start;
  const elapsed = now - start;

  return Math.min(Math.round((elapsed / total) * 100), 100);
});

// Method to check if trip is delayed
tripSchema.methods.isDelayed = function () {
  if (!this.actualDeparture) return false;
  const delay = this.actualDeparture - this.scheduledDeparture;
  return delay > 15 * 60 * 1000; // 15 minutes threshold
};

// Method to add delay record
tripSchema.methods.addDelay = function (reason, duration, location) {
  this.delays.push({
    reason,
    duration,
    location,
    timestamp: new Date(),
  });

  if (this.status !== 'delayed' && duration > 15) {
    this.status = 'delayed';
  }
};

// Method to update current location
tripSchema.methods.updateLocation = function (coordinates) {
  this.currentLocation.coordinates = coordinates;
  return this.save();
};

// Static method to find nearby trips
tripSchema.statics.findNearbyTrips = function (coordinates, maxDistance) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'in_progress',
  });
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
