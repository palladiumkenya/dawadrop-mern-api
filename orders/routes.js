const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  createDeliveryServiceRequest,
  updateDeliveryServiceRequest,
  getDeliveryServiceRequestDetail,
  getPendingDeliveryServiceRequest,
  getDeliveryServiceRequest,
} = require("./views/deliveryRequest");
const { getDispenseOrder, dispenseDrug } = require("./views/dispense");

const router = Router();

router.get("/", [auth], getDeliveryServiceRequest);
router.get("/pending", [auth], getPendingDeliveryServiceRequest);
router.get("/dispense", [auth], getDispenseOrder);
router.post("/dispense", [auth], dispenseDrug);
router.post("/", [auth], createDeliveryServiceRequest);
router.put("/:id", [auth], updateDeliveryServiceRequest);
router.get("/:id", [auth], getDeliveryServiceRequestDetail);

module.exports = router;
