const Bus = require("../models/busModel");

exports.getAllBuss = async (req, res) => {
    try {
     
      const buss = await Bus.find();
  
      res.status(200).json({
        status: 'success',
        results: buss.length,
        data: {
          buss
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
  
  exports.getBus = async (req, res) => {
    try {
      const bus = await Bus.findById(req.params.id);
  
      res.status(200).json({
        status: 'success',
        data: {
          bus
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
  
  exports.createBus = async (req, res) => {
    try {
    
      const newBus = await Bus.create(req.body);
  
      res.status(201).json({
        status: 'success',
        data: {
          bus: newBus
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
    }
  };
  
  exports.updateBus = async (req, res) => {
    try {
      const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({
        status: 'success',
        data: {
          bus
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
  
  exports.deleteBus = async (req, res) => {
    try {
      await Bus.findByIdAndDelete(req.params.id);
  
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };








