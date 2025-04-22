const HajjRequest = require("../models/hajjRequestModel");
const Bus = require("../models/busModel");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await HajjRequest.find().populate("busId");
    res.status(200).json({
      status: "success",
      results: requests.length,
      data: { 
        requests
     }
    });
  } catch (err) {
    res.status(404).json({
         status: "fail",
          message: err
         });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await HajjRequest.findById(req.params.id).populate("busId");
    res.status(200).json({
      status: "success",
      data: { 
        request
     }
    });
  } catch (err) {
    res.status(404).json({
         status: "fail",
          message: err 
        });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const newRequest = await HajjRequest.create(req.body);
    res.status(201).json({
      status: "success",
      data: { 
        request: newRequest
     }
    });
  } catch (err) {
    res.status(400).json({ 
        status: "fail",
         message: err
         });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await HajjRequest.findByIdAndDelete(req.params.id);
    res.status(204).json({ 
        status: "success",
         data: null
         });
  } catch (err) {
    res.status(404).json({ 
        status: "fail",
         message: err
         });
  }
};

exports.assignNearestBus = async (req, res) => {
  try {
    const { userId, coordinates } = req.body;

    const nearestBus = await Bus.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates
          },
          $maxDistance: 10000
        }
      },
      available: true
    });

    if (!nearestBus) {
      return res.status(404).json({ 
        status: "fail",
         message: "No available buses nearby"
         });
    }

    const request = await HajjRequest.create({
      userId,
      coordinates,
      busId: nearestBus._id,
      status: "assigned"
    });

    nearestBus.available = false;
    await nearestBus.save();

    res.status(201).json({
       status: "success",
        data: { request }
       });
  } catch (err) {
    res.status(400).json({ 
      status: "fail",
       message: err 
      });
  }
};
