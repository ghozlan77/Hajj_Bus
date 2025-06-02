const express = require('express');
const stationController = require('../controllers/stationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(stationController.getAllStations)
  .post(
    authController.restrictTo('admin', 'supervisor'),
    stationController.createStation,
  );

router
  .route('/:id')
  .get(stationController.getStation)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    stationController.updateStation,
  )
  .delete(authController.restrictTo('admin'), stationController.deleteStation);

router.get('/nearby', stationController.getNearbyStations);
router.get('/active', stationController.getActiveStations);

router
  .route('/:id/status')
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    stationController.updateStationStatus,
  );

module.exports = router;
