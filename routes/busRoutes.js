const express = require('express');
const busController = require('../controllers/busController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(busController.getAllBuses)
  .post(
    authController.restrictTo('admin', 'supervisor'),
    busController.createBus,
  );

router
  .route('/:id')
  .get(busController.getBus)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    busController.updateBus,
  )
  .delete(authController.restrictTo('admin'), busController.deleteBus);

router
  .route('/:id/status')
  .patch(
    authController.restrictTo('admin', 'supervisor', 'driver'),
    busController.updateBusStatus,
  );

router.get('/available', busController.getAvailableBuses);
router.get('/maintenance', busController.getBusesInMaintenance);
router.get('/active', busController.getActiveBuses);

module.exports = router;
