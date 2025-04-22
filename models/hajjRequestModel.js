const mongoose = require("mongoose");

const hajjRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: false 
  },

  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },

  status: {
    type: String,
    enum: ["pending", "assigned", "completed", "cancelled"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

hajjRequestSchema.index({ coordinates: "2dsphere" });

const HajjRequest = mongoose.model("HajjRequest", hajjRequestSchema);
module.exports = HajjRequest;