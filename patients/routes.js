const { Router } = require("express");
const auth = require("../middleware/auth");
const Patient = require("./models/Patient");
const { profileValidator, deliveryFeedBackValidator } = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const { searchPatient, sendOtp, sendSms } = require("./api");
const AccountVerification = require("./models/AccountVerification");
const moment = require("moment/moment");
const hasNoProfile = require("../middleware/hasNoProfile");
const isValidPatient = require("../middleware/isValidPatient");
const {
  getPatientAppointments: getPatientRemoteAppointments,
} = require("../appointments/api");
const { isEmpty } = require("lodash");
const User = require("../auth/models/User");
const DeliveryServiceRequest = require("../orders/models/DeliveryServiceRequest");
const { patientOrderValidator } = require("../orders/validators");
const TimeSlot = require("../deliveries/models/TimeSlot");
const Mode = require("../deliveries/models/Mode");
const DeliveryMethod = require("../deliveries/models/DeliveryMethod");
const Delivery = require("../deliveries/models/Delivery");
const DeliveryFeedBack = require("../deliveries/models/DeliveryFeedBack");
const { addCareGiver, updateCareGiver } = require("./views/treatmentSurport");
const {
  verifyPatientAndAddAsCareReceiver,
  checkCareReceiverEligibility,
  makeOrder,
  careReceiverOrders,
} = require("./views/orderForAnother");
const { validateOrder, eligibityTest } = require("./views/utils");
const {
  createDeliveryServiceRequest,
} = require("../orders/views/deliveryRequest");
const { findPatient } = require("./views/patients");
const {
  getPatientAppointments,
  getAppointmentDetail,
} = require("./views/appointments");
const {
  getPatientsDeliveryRequests,
  getPatientDeliveries,
  patientRequestEligibilityTest,
  getDeliveryRequestDetail,
  deliveryFeedBack,
} = require("./views/deliveryRequests");
const { createProfile, verify } = require("./views/sync");
const router = Router();

router.get("/", auth, findPatient);
router.get("/appointments", [auth, isValidPatient], getPatientAppointments);
router.get("/appointments/:id", [auth, isValidPatient], getAppointmentDetail);
router.get("/orders", [auth, isValidPatient], getPatientsDeliveryRequests);
router.get("/deliveries", [auth, isValidPatient], getPatientDeliveries);

router.get(
  "/orders/check-eligibility",
  [auth, isValidPatient],
  patientRequestEligibilityTest
);
router.get("/orders/:id", [auth, isValidPatient], getDeliveryRequestDetail);
router.post("/orders", [auth, isValidPatient], createDeliveryServiceRequest);
router.post("/create-profile", [auth, hasNoProfile], createProfile);
router.post("/verify", auth, verify);
router.post("/delivery-feedback", [auth, isValidPatient], deliveryFeedBack);
router.post("/ralations/add-care-giver", [auth, isValidPatient], addCareGiver);
router.post(
  "/ralations/verify-and-add-care-receiver",
  [auth, isValidPatient],
  verifyPatientAndAddAsCareReceiver
);
router.get(
  "/relations/check-order-eligibility",
  [auth, isValidPatient],
  checkCareReceiverEligibility
);
router.post("/relations/order", [auth, isValidPatient], makeOrder);
router.get("/relations/order", [auth, isValidPatient], careReceiverOrders);
router.put(
  "/ralations/:id/update-care-giver",
  [auth, isValidPatient],
  updateCareGiver
);

module.exports = router;
