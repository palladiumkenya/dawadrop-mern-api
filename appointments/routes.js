const { Router } = require("express");
const { getPatientAppointments } = require("./api");
const auth = require("../middleware/auth");
const {
  getCareReceiverUpcomingAppointments,
  getAllMyCareReceiversUpcomingAppointments,
} = require("./views/careReceivers");

const router = Router();

router.get(
  "/care-receiver/:cccNumber",
  auth,
  getCareReceiverUpcomingAppointments
);
router.get("/care-receiver", auth, getAllMyCareReceiversUpcomingAppointments);
module.exports = router;
