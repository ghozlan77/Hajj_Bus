const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  number: {
    type: String,
    required: [true, 'Bus must have a number'],
    unique: true
  },
  driver: {
    type: String,
    required: [true, 'Bus must have a driver']
  },
  location: {
    lat: {
         type: Number,
          required: true 
        },
    lng: { 
        type: Number,
         required: true 
    }
  },
  status: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available'
  }
 
  
});

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;
