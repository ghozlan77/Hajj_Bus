const express = require('express');
const tripController = require('../controllers/tripController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(tripController.getAllTrips)
  .post(
    authController.restrictTo('admin', 'supervisor'),
    tripController.createTrip,
  );

router
  .route('/:id')
  .get(tripController.getTrip)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    tripController.updateTrip,
  )
  .delete(authController.restrictTo('admin'), tripController.deleteTrip);

router
  .route('/:id/status')
  .patch(
    authController.restrictTo('admin', 'supervisor', 'driver'),
    tripController.updateTripStatus,
  );

router
  .route('/:id/location')
  .patch(
    authController.restrictTo('driver'),
    tripController.updateTripLocation,
  );

router
  .route('/:id/passengers')
  .post(
    authController.restrictTo('admin', 'supervisor'),
    tripController.addPassenger,
  )
  .get(tripController.getTripPassengers);

router
  .route('/:id/delays')
  .post(
    authController.restrictTo('admin', 'supervisor', 'driver'),
    tripController.recordDelay,
  )
  .get(tripController.getTripDelays);

router.get('/nearby', tripController.getNearbyTrips);

router.get('/bus/:busId', tripController.getBusTrips);

router.get('/driver/:driverId', tripController.getDriverTrips);

module.exports = router;
