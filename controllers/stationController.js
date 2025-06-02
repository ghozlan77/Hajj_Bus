const Station = require('../models/station');

exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json({
      status: 'success',
      results: stations.length,
      data: {
        stations,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        station,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createStation = async (req, res) => {
  try {
    const newStation = await Station.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        station: newStation,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        station,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
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

exports.getNearestStation = async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates) {
      return res.status(400).json({
        status: 'fail',
        message: 'provide the location coordinates.',
      });
    }

    const station = await Station.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: 5000,
        },
      },
    });

    if (!station) {
      return res.status(404).json({
        status: 'fail',
        message: 'no stations nearby',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        station,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
