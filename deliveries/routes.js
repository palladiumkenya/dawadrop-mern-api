const { Router } = require("express");
const Mode = require("./models/Mode");
const {
  modeValidator,
  timeSlotValidator,
  deliveryMethodValidator,
  deliveryValidator,
} = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const TimeSlot = require("./models/TimeSlot");
const DeliveryMethod = require("./models/DeliveryMethod");
const Delivery = require("./models/Delivery");
const auth = require("./../middleware/auth");
const DeliveryServiceRequest = require("../orders/models/DeliveryServiceRequest");
const { Types } = require("mongoose");
const { merge } = require("lodash");
const {
  getCourrierServices,
  createCourrierServices,
  updateCourrierServices,
  getCourrierServicesDetail,
} = require("./views/courrier");
const {
  getDeliveries,
  getMyDeliveriesHistory,
  createDelivery,
  updateDelivery,
  deliveryAction,
  getDeliveryDetail,
} = require("./views/delivery");
const {
  getDeliveryMethods,
  createDeliveryMethod,
  updateDeliveryMethod,
} = require("./views/methods");
const {
  getTimeSlots,
  getTimeSlotDetail,
  createTimeSlot,
  updateTimeSlot,
} = require("./views/timeslot");
const { getModes, getModeDetail, createMode, updateMode } = require("./views/modes");

const router = Router();

router.get("/modes", getModes);
router.get("/modes/:id", getModeDetail);
router.post("/modes", createMode);
router.put("/modes/:id", updateMode);

router.get("/timeslots", getTimeSlots);

router.get("/timeslots/:id", getTimeSlotDetail);

router.post("/timeslots", createTimeSlot);

router.put("/timeslots/:id", updateTimeSlot);
router.get("/methods", getDeliveryMethods);
router.get("/methods/:id", getDeliveryDetail);

router.post("/methods", createDeliveryMethod);

router.put("/methods/:id", updateDeliveryMethod);

router.get("/", getDeliveries);
router.get("/history", [auth], getMyDeliveriesHistory);
router.post("/", createDelivery);
router.put("/:id", updateDelivery);
router.post("/:id/:action", deliveryAction);

router.get("/courrier-services", getCourrierServices);
router.post("/courrier-services", createCourrierServices);
router.put("/courrier-services/:id", updateCourrierServices);
router.get("/courrier-services/:id", getCourrierServicesDetail);

router.get("/:id", getDeliveryDetail);

module.exports = router;
