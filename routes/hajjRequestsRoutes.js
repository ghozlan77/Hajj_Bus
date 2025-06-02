const express = require('express');
const hajjRequestController = require('../controllers/hajjRequestController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'supervisor'),
    hajjRequestController.getAllRequests,
  )
  .post(hajjRequestController.createRequest);

router
  .route('/:id')
  .get(hajjRequestController.getRequest)
  .patch(
    authController.restrictTo('admin', 'supervisor'),
    hajjRequestController.updateRequest,
  )
  .delete(
    authController.restrictTo('admin'),
    hajjRequestController.deleteRequest,
  );

router.post(
  '/assign',
  authController.restrictTo('admin', 'supervisor'),
  hajjRequestController.assignNearestBus,
);

router.get('/pending', hajjRequestController.getPendingRequests);
router.get('/completed', hajjRequestController.getCompletedRequests);

module.exports = router;
