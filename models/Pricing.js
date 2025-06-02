const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Price plan name is required'],
      trim: true,
      unique: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR'],
    },
    type: {
      type: String,
      required: [true, 'Price type is required'],
      enum: ['standard', 'premium', 'vip'],
    },
    seasonalMultiplier: {
      type: Number,
      default: 1,
      min: [0.1, 'Seasonal multiplier cannot be less than 0.1'],
      max: [5, 'Seasonal multiplier cannot exceed 5'],
    },
    discounts: [
      {
        name: {
          type: String,
          required: [true, 'Discount name is required'],
        },
        percentage: {
          type: Number,
          required: [true, 'Discount percentage is required'],
          min: [0, 'Discount cannot be negative'],
          max: [100, 'Discount cannot exceed 100%'],
        },
        startDate: Date,
        endDate: Date,
        conditions: {
          minPassengers: {
            type: Number,
            default: 1,
          },
          earlyBooking: {
            type: Number,
            default: 0,
          },
        },
      },
    ],
    additionalServices: [
      {
        name: {
          type: String,
          required: [true, 'Service name is required'],
        },
        price: {
          type: Number,
          required: [true, 'Service price is required'],
          min: [0, 'Service price cannot be negative'],
        },
        description: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Validate dates
pricingSchema.pre('save', function (next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  }
  next();
});

// Calculate final price
pricingSchema.methods.calculateFinalPrice = function (
  passengers = 1,
  bookingDate = new Date(),
) {
  let finalPrice = this.basePrice * this.seasonalMultiplier;

  // Apply applicable discounts
  this.discounts.forEach((discount) => {
    if (
      discount.startDate <= bookingDate &&
      discount.endDate >= bookingDate &&
      passengers >= discount.conditions.minPassengers
    ) {
      finalPrice *= 1 - discount.percentage / 100;
    }
  });

  return finalPrice;
};

// Check if pricing is currently valid
pricingSchema.virtual('isCurrentlyValid').get(function () {
  const now = new Date();
  return this.isActive && this.validFrom <= now && this.validUntil >= now;
});

const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = Pricing;
