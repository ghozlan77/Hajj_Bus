const express = require('express');
const seatController = require('../controllers/seatController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(seatController.getAllSeats)
  .post(
    authController.restrictTo('admin', 'supervisor'),
    seatController.createSeat,
  );

router
  .route('/:id')
  .get(seatController.getSeat)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    seatController.updateSeat,
  )
  .delete(authController.restrictTo('admin'), seatController.deleteSeat);

router.get('/bus/:busId/available', seatController.getAvailableSeats);

router
  .route('/:id/status')
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    seatController.updateSeatStatus,
  );

router
  .route('/:id/maintenance')
  .post(
    authController.restrictTo('admin', 'supervisor', 'maintenance'),
    seatController.addMaintenanceRecord,
  );

router.get(
  '/maintenance/needed',
  authController.restrictTo('admin', 'supervisor', 'maintenance'),
  seatController.getSeatsNeedingMaintenance,
);

module.exports = router;
