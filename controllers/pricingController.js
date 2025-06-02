const Pricing = require('../models/Pricing');

exports.getAllPrices = async (req, res) => {
  try {
    const prices = await Pricing.find();
    res.status(200).json({
      status: 'success',
      results: prices.length,
      data: {
        prices,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getPrice = async (req, res) => {
  try {
    const price = await Pricing.findById(req.params.id);
    if (!price) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price plan not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        price,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createPrice = async (req, res) => {
  try {
    const newPrice = await Pricing.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        price: newPrice,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const price = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!price) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price plan not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        price,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    const price = await Pricing.findByIdAndDelete(req.params.id);
    if (!price) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price plan not found',
      });
    }
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

exports.calculatePrice = async (req, res) => {
  try {
    const { priceId, passengers, bookingDate } = req.body;

    const price = await Pricing.findById(priceId);
    if (!price) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price plan not found',
      });
    }

    if (!price.isCurrentlyValid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Price plan is not currently valid',
      });
    }

    const finalPrice = price.calculateFinalPrice(
      passengers,
      new Date(bookingDate),
    );

    res.status(200).json({
      status: 'success',
      data: {
        basePrice: price.basePrice,
        finalPrice,
        currency: price.currency,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
