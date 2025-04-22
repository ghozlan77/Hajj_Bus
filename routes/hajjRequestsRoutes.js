const express = require("express");
const router = express.Router();
const hajjRequestController = require("../controllers/hajjRequestController");



router.post("/assign", hajjRequestController.assignNearestBus);

router.route("/")
  .get(hajjRequestController.getAllRequests)
  .post(hajjRequestController.createRequest);

router.route("/:id")
  .get(hajjRequestController.getRequest)
  .delete(hajjRequestController.deleteRequest);



module.exports = router;
