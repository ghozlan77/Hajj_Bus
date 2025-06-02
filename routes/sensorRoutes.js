const express = require('express');
const sensorController = require('../controllers/sensorController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(sensorController.getAllSensors)
  .post(
    authController.restrictTo('admin', 'supervisor'),
    sensorController.createSensor,
  );

router
  .route('/:id')
  .get(sensorController.getSensor)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    sensorController.updateSensor,
  )
  .delete(authController.restrictTo('admin'), sensorController.deleteSensor);

router
  .route('/:id/readings')
  .post(sensorController.addReading)
  .get(sensorController.getSensorReadings);

router
  .route('/:id/calibration')
  .post(
    authController.restrictTo('admin', 'supervisor', 'maintenance'),
    sensorController.addCalibrationRecord,
  );

router.get(
  '/calibration/needed',
  authController.restrictTo('admin', 'supervisor', 'maintenance'),
  sensorController.getSensorsNeedingCalibration,
);

router.get('/type/:type', sensorController.getSensorsByType);

router.get('/bus/:busId', sensorController.getBusSensors);

module.exports = router;
