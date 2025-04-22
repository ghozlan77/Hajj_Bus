const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: String,
    enum: ["hajj", "driver", "admin"],
    default: "hajj"
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  }
});

// تفعيل إندكس جغرافي عشان تستخدم $near وغيره
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
module.exports = User;
