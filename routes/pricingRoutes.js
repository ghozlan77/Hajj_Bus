const express = require('express');
const pricingController = require('../controllers/pricingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(pricingController.getAllPricing)
  .post(authController.restrictTo('admin'), pricingController.createPricing);

router
  .route('/:id')
  .get(pricingController.getPricing)
  .patch(authController.restrictTo('admin'), pricingController.updatePricing)
  .delete(authController.restrictTo('admin'), pricingController.deletePricing);

router.get('/calculate/:distance', pricingController.calculatePrice);
router.get('/seasonal', pricingController.getSeasonalPricing);

module.exports = router;
