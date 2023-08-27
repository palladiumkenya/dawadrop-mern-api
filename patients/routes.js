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
const { getPatientAppointments } = require("../appointments/api");
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
const router = Router();

router.get("/", auth, async (req, res) => {
  const patients = await Patient.find().populate("user", {
    password: false,
    __v: false,
  });
  res.json({ results: patients });
});
router.get("/appointments", [auth, isValidPatient], async (req, res) => {
  const query = req.params;
  const patient = await Patient.findOne({ user: req.user._id });
  const appointments = await getPatientAppointments(patient.cccNumber);
  if (isEmpty(appointments)) return res.json({ results: [] });
  else
    res.json({
      results: appointments
        .sort((a, b) => {
          const nextAppointmentDateA = moment(a.next_appointment_date);
          const nextAppointmentDateB = moment(b.next_appointment_date);
          return nextAppointmentDateA - nextAppointmentDateB;
        })
        .filter(({ next_appointment_date }) => {
          const daysDiff = moment(next_appointment_date).diff(
            new Date(),
            "days"
          );
          const upComing = query.upComing === "true";

          if (!upComing) {
            return daysDiff >= 0 && daysDiff <= 7;
          } else {
            return true;
          }
        }),

      // .sort(
      //   (a, b) =>
      //     moment(a.next_appointment_date).diff(new Date()) -
      //     moment(b.next_appointment_date).diff(new Date())
      // ),
    });
  // res.json(base64Decode("Mg=="));
});
router.get("/appointments/:id", [auth, isValidPatient], async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const appointments = (await getPatientAppointments(patient.cccNumber)) || [];
  const appointment = appointments.find((apt) => `${apt.id}` === req.params.id);
  if (!appointment) {
    res.status(404).json({ detail: "Appointment not found" });
  } else res.json(appointment);
  // res.json(base64Decode("Mg=="));
});
router.get("/orders", [auth, isValidPatient], async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const orders = await DeliveryServiceRequest.aggregate([
    {
      $match: {
        patient: patient._id,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "careGiver",
        as: "careGiver",
      },
    },
    {
      $lookup: {
        from: "deliveries",
        foreignField: "order",
        localField: "_id",
        as: "deliveries",
      },
    },
  ]);
  return res.json({ results: orders });
});
router.get("/deliveries", [auth, isValidPatient], async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const orders = (
    await DeliveryServiceRequest.find({ patient: patient._id })
  ).map((order) => order._id);
  const deliveries = await Delivery.find({ order: { $in: orders } });
  return res.json({ results: deliveries });
});

router.get(
  "/orders/check-eligibility",
  [auth, isValidPatient],
  async (req, res) => {
    try {
      const patient = await Patient.findOne({ user: req.user._id });
      const { appointment, currentRegimen } = await eligibityTest(patient._id);

      return res.json({ appointment, currentRegimen });
    } catch (error) {
      const { error: err, status } = getValidationErrrJson(error);
      return res.status(status).json(err);
    }
  }
);
router.get("/orders/:id", [auth, isValidPatient], async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const order = await DeliveryServiceRequest.findOne({
    patient: patient._id,
    _id: req.params.id,
  }).populate("patient");
  if (!order) {
    return res.status(404).json({ detail: "DeliveryServiceRequest not found" });
  }
  return res.json(order);
});
// router.post("/orders", [auth, isValidPatient], async (req, res) => {
//   try {
//     console.log(req.body);
//     const patient = await Patient.findOne({ user: req.user._id });
//     const { values, method, regimen, treatmentSupport, appointment } =
//       await validateOrder(patient, req.body, patient);
//     // 3. Create a new appointment on EMR
//     // 4. Create Drug order in Kenya EMR
//     // 5. If 3 & 4 are successfull, create local order
//     const order = new DeliveryServiceRequest({
//       ...values,
//       deliveryTimeSlot: await TimeSlot.findById(values["deliveryTimeSlot"]),
//       deliveryMode: await Mode.findById(values["deliveryMode"]),
//       deliveryMethod: method,
//       patient: patient._id,
//       appointment: appointment,
//       drug: regimen,
//       careGiver:
//         method.blockOnTimeSlotFull === false
//           ? treatmentSupport.careGiver
//           : undefined,
//       orderedBy: req.user._id,
//     });
//     await order.save();
//     // 6. Send success sms message on sucess DeliveryServiceRequest
//     await sendSms(
//       `Dear dawadrop user,Your order has been received successfully.Your order id is ${order._id}`,
//       req.user.phoneNumber
//     );
//     return res.json(await order.populate("patient"));
//   } catch (error) {
//     const { error: err, status } = getValidationErrrJson(error);
//     return res.status(status).json(err);
//   }
// });
router.post("/orders", [auth, isValidPatient], createDeliveryServiceRequest);
router.put("/orders/:id", [auth, isValidPatient], async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const order = await DeliveryServiceRequest.findOne({
      _id: req.params.id,
      patient: patient._id,
    });
    delete req.body.deliveryAddress._id;
    const values = await patientOrderValidator(req.body);

    order.deliveryTimeSlot = await TimeSlot.findById(
      values["deliveryTimeSlot"]
    );
    order.deliveryMode = await Mode.findById(values["deliveryMode"]);
    order.deliveryMethod = await DeliveryMethod.findById(
      values["deliveryMethod"]
    );
    order.phoneNumber = values["phoneNumber"];

    order.deliveryAddress = values["deliveryAddress"];
    await order.save();
    // 6. Send success sms message on sucess DeliveryServiceRequest
    await sendSms(
      `Dear dawadrop user,Your order ( ${order._id}) update has been received successfully.`,
      req.user.phoneNumber
    );
    return res.json(await order.populate("patient"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.post("/create-profile", [auth, hasNoProfile], async (req, res) => {
  try {
    const { cccNumber, firstName, upiNo } = await profileValidator(req.body);
    const remotePatient = await searchPatient(cccNumber);
    if (!remotePatient)
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    console.log(remotePatient);
    if (remotePatient.f_name.toLowerCase() !== firstName.toLowerCase())
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (upiNo && remotePatient.upi_no !== upiNo)
      throw Error(
        "Verification Error!\nUPI Number / First Name / CCC Number do not match"
      );

    const patient = await Patient.getOrCreatePatientFromRemote(remotePatient);
    if (patient.user && (await User.findOne({ _id: patient.user }))) {
      throw {
        status: 403,
        message: "User with provided CCC Number already exist",
      };
    }
    const verification = await AccountVerification.getOrCreate({
      user: req.user._id,
      extra: patient._id,
    });
    await sendOtp(verification.otp, req.user.phoneNumber);
    return res.json({
      message: `Account verification Success.use OTP sent to ${req.user.phoneNumber} to complete your profile creation in the next 5 minutes`,
    });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.post("/verify", auth, async (req, res) => {
  try {
    const code = req.body.code;
    if (!code)
      throw {
        details: [{ path: ["code"], message: "Please Provide OTP Code" }],
      };
    const verification = await AccountVerification.findOne({
      user: req.user._id,
      verified: false,
      expiry: {
        $gte: moment(),
      },
      otp: String(code),
    });
    if (!verification)
      throw {
        details: [{ path: ["code"], message: "Invalid or Expired code!" }],
      };
    const patient = await Patient.findOne({ _id: verification.extra });
    patient.user = req.user._id;
    await patient.save();
    verification.verified = true;
    await verification.save();
    res.json(
      await patient.populate("user", "_id username email phoneNumber roles")
    );
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.post("/delivery-feedback", [auth, isValidPatient], async (req, res) => {
  try {
    const value = await deliveryFeedBackValidator(req.body);
    const delivery = await Delivery.findOne({ _id: value.delivery });
    if (!delivery)
      throw {
        details: [{ path: ["delivery"], message: "Invalid Delivery" }],
      };
    if (delivery.status !== "pending")
      throw {
        details: [{ path: ["delivery"], message: "Invalid Delivery" }],
      };
    const isRecepient = await delivery.isRecepientUser(req.user._id);
    if (!isRecepient)
      throw {
        details: [{ path: ["delivery"], message: "Invalid Delivery" }],
      };
    const feedBack = new DeliveryFeedBack(value);
    await feedBack.save();
    delivery.status = "delivered";
    await delivery.save();
    return res.json(feedBack);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
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
