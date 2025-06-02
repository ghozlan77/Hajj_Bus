const Bus = require('../models/busModel');

const getAllBuses = async (req, res) => {
  try {
    const buss = await Bus.find();

    res.status(200).json({
      status: 'success',
      results: buss.length,
      data: {
        buss,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const getBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        bus,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const createBus = async (req, res) => {
  try {
    const newBus = await Bus.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        bus: newBus,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        bus,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const updateBusLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    const bus = await Bus.findByIdAndUpdate(id, { location }, { new: true });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getAllBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
  updateBusLocation,
};
