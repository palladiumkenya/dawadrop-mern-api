const { omit } = require("lodash");
const Delivery = require("../../deliveries/models/Delivery");
const DeliveryFeedBack = require("../../deliveries/models/DeliveryFeedBack");
const DeliveryServiceRequest = require("../../orders/models/DeliveryServiceRequest");
const { getValidationErrrJson } = require("../../utils/helpers");
const Patient = require("../models/Patient");
const { deliveryFeedBackValidator } = require("../validators");
const { eligibityTest } = require("./utils");

const getPatientsDeliveryRequests = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const orders = await DeliveryServiceRequest.aggregate([
    {
      $match: {
        $or: [
          { patient: patient?._id, include: patient },
          { orderedBy: req.user._id, include: true },
        ]
          .filter((f) => f.include)
          .map((f) => omit(f, ["include"])),
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
        from: "patients",
        foreignField: "_id",
        localField: "patient",
        as: "patient",
      },
    },
    {
      $lookup: {
        from: "deliveries",
        foreignField: "order",
        localField: "_id",
        as: "delivery",
      },
    },
    {
      $lookup: {
        from: "deliveryfeedbacks",
        foreignField: "delivery",
        localField: "delivery._id",
        as: "feedBack",
      },
    },
  ]);
  return res.json({ results: orders });
};

const getPatientDeliveries = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const orders = (
    await DeliveryServiceRequest.find({ patient: patient._id })
  ).map((order) => order._id);
  const deliveries = await Delivery.find({ order: { $in: orders } });
  return res.json({ results: deliveries });
};

const patientRequestEligibilityTest = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const { appointment, currentRegimen } = await eligibityTest(patient._id);

    return res.json({ appointment, currentRegimen });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const getDeliveryRequestDetail = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const order = await DeliveryServiceRequest.findOne({
    patient: patient._id,
    _id: req.params.id,
  }).populate("patient");
  if (!order) {
    return res.status(404).json({ detail: "DeliveryServiceRequest not found" });
  }
  return res.json(order);
};

const deliveryFeedBack = async (req, res) => {
  try {
    const value = await deliveryFeedBackValidator(req.body);
    const delivery = await Delivery.findOne({ _id: value.delivery });
    if (!delivery)
      throw {
        details: [{ path: ["delivery"], message: "Invalid Delivery" }],
      };
    // Check if delivery is based on order/request
    const orderId = delivery.order;
    if (orderId) {
      const order = await DeliveryServiceRequest.findOne({ _id: orderId });
      // if delivery is asociated with order, make sure order exist and was ordered by current user
      if (!order || !order.orderedBy.equals(req.user._id)) {
        throw {
          details: [{ path: ["delivery"], message: "Invalid Delivery" }],
        };
      }
    } else {
      // If not asociated with order, makes sure curr user is patient and delivery.patient is curr patient
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient || !delivery.patient.equals(patient._id))
        throw {
          details: [{ path: ["delivery"], message: "Invalid Delivery" }],
        };
    }
    const feedBack = new DeliveryFeedBack(value);
    await feedBack.save();
    delivery.status = "delivered";
    await delivery.save();
    return res.json(feedBack);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
module.exports = {
  getPatientsDeliveryRequests,
  getPatientDeliveries,
  patientRequestEligibilityTest,
  getDeliveryRequestDetail,
  deliveryFeedBack,
};
