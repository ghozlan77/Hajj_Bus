const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      unique: true,
      trim: true,
    },
    bus: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bus',
      required: [true, 'Seat must belong to a bus'],
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'occupied', 'maintenance', 'reserved'],
      default: 'available',
    },
    seatType: {
      type: String,
      enum: ['standard', 'premium', 'business', 'accessible'],
      default: 'standard',
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [1, 'Floor number must be at least 1'],
    },
    position: {
      type: String,
      enum: ['window', 'aisle', 'middle'],
      required: [true, 'Seat position is required'],
    },
    features: [
      {
        type: String,
        enum: ['USB', 'power_outlet', 'adjustable', 'footrest', 'table'],
      },
    ],
    price: {
      type: Number,
      required: [true, 'Seat price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currentPassenger: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    nextMaintenance: Date,
    maintenanceHistory: [
      {
        date: Date,
        type: String,
        description: String,
        technician: String,
      },
    ],
    seatCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_maintenance'],
      default: 'excellent',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for faster queries
seatSchema.index({ bus: 1, seatNumber: 1 });
seatSchema.index({ status: 1 });

// Virtual populate for booking history
seatSchema.virtual('bookingHistory', {
  ref: 'Booking',
  foreignField: 'seat',
  localField: '_id',
});

// Middleware to update maintenance schedule
seatSchema.pre('save', function (next) {
  if (!this.nextMaintenance) {
    // Set next maintenance date to 3 months from now
    this.nextMaintenance = new Date(
      new Date().setMonth(new Date().getMonth() + 3),
    );
  }
  next();
});

// Instance method to check if seat needs maintenance
seatSchema.methods.needsMaintenance = function () {
  return (
    this.nextMaintenance <= new Date() ||
    this.seatCondition === 'needs_maintenance'
  );
};

// Static method to find available seats in a bus
seatSchema.statics.findAvailableSeats = function (busId) {
  return this.find({
    bus: busId,
    status: 'available',
  }).select('seatNumber floor position seatType price');
};

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
