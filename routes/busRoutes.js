const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");


router.route('/')
  .get(busController.getAllBuses)
  .post(busController.createBus);

router.route('/:id')
  .get(busController.getBus)
  .patch( busController.updateBus)
  .delete( busController.deleteBus);




module.exports = router;
