const { Types } = require("mongoose");
const { getPatientAppointments } = require("../../appointments/api");
const { getValidationErrrJson } = require("../../utils/helpers");
const { searchPatient, getRegimen, sendSms } = require("../api");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { profileValidator } = require("../validators");
const { isEmpty } = require("lodash");
const { eligibityTest, validateOrder } = require("./utils");
const Order = require("../../orders/models/Order");
const TimeSlot = require("../../deliveries/models/TimeSlot");
const Mode = require("../../deliveries/models/Mode");

const verifyPatientAndAddAsCareReceiver = async (req, res) => {
  try {
    // vERIFY PATENT INFO
    const { cccNumber, firstName, upiNo } = await profileValidator(req.body);
    const remotePatient = await searchPatient(cccNumber);
    if (!remotePatient)
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (remotePatient.f_name.toLowerCase() !== firstName.toLowerCase())
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (upiNo && remotePatient.upi_no !== upiNo)
      throw Error(
        "Verification Error!\nUPI Number / First Name / CCC Number do not match"
      );

    const patient = await Patient.getOrCreatePatientFromRemote(remotePatient);
    if (patient.user.equals(req.user._id)) {
      throw {
        status: 403,
        message: "Invalid Operation.Cant add yourself as careReceiver",
      };
    }
    // Check if asociation exists
    const asociation = await TreatmentSurport.findOne({
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    if (asociation) {
      asociation.canOrderDrug = true;
      await asociation.save();
      return res.json(await asociation.populate("careGiver careReceiver"));
    }
    // Create asociation
    const tSupport = new TreatmentSurport({
      canOrderDrug: true,
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    await tSupport.save();
    return res.json(await tSupport.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const checkCareReceiverEligibility = async (req, res) => {
  try {
    const asocialtionId = req.query.careReceiver;
    if (!asocialtionId)
      throw {
        status: 400,
        message: '"careReceiver" query parameter is required',
      };
    const asociation = await TreatmentSurport.findOne({
      _id: asocialtionId,
      canOrderDrug: true,
      careGiver: req.user._id,
      careReceiver: { $exists: true, $ne: null },
    });
    if (!asociation)
      throw {
        status: 400,
        message: "Invalid Care receiver",
      };

    const { appointment, currentRegimen } = await eligibityTest(
      asociation.careReceiver
    );

    return res.json({ appointment, currentRegimen });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const makeOrder = async (req, res) => {
  try {
    if (!req.body.careReceiver)
      throw {
        details: [
          { path: ["careReceiver"], message: "Care receiver is required" },
        ],
      };
    const careReceiverAsociation = await TreatmentSurport.findOne({
      _id: req.body.careReceiver,
      canOrderDrug: true,
      careGiver: req.user._id,
    });
    if (!careReceiverAsociation)
      throw {
        details: [{ path: ["careReceiver"], message: "Invalid Care receiver" }],
      };
    const patient = await Patient.findOne({
      _id: careReceiverAsociation.careReceiver,
    });
    const delegatePatient = await Patient.findOne({
      user: req.user._id,
    });
    const { values, method, regimen, treatmentSupport, appointment } =
      await validateOrder(patient, req.body, delegatePatient);
    // 3. Create a new appointment on EMR
    // 4. Create Drug order in Kenya EMR
    // 5. If 3 & 4 are successfull, create local order
    const order = new Order({
      ...values,
      deliveryTimeSlot: await TimeSlot.findById(values["deliveryTimeSlot"]),
      deliveryMode: await Mode.findById(values["deliveryMode"]),
      deliveryMethod: method,
      patient: patient._id,
      appointment: appointment,
      drug: regimen,
      careGiver:
        method.blockOnTimeSlotFull === false
          ? treatmentSupport.careGiver
          : undefined,
      orderedBy: req.user._id,
    });
    await order.save();
    // 6. Send success sms message on sucess Order
    await sendSms(
      `Dear dawadrop user,Your order has been received successfully.Your order id is ${order._id}`,
      req.user.phoneNumber
    );
    return res.json(await order.populate("patient"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const careReceiverOrders = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const orders = await Order.aggregate([
    {
      $match: {
        patient: { $ne: patient._id },
        orderedBy: req.user._id,
      },
    },
    {
      $lookup: {
        from: "User",
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
};
module.exports = {
  verifyPatientAndAddAsCareReceiver,
  checkCareReceiverEligibility,
  makeOrder,
  careReceiverOrders,
};
