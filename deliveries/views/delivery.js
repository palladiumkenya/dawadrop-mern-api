const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const { deliveryValidator } = require("../validators");
const Delivery = require("../models/Delivery");

const getDeliveries = async (req, res) => {
  try {
    const methods = await Delivery.aggregate([
      {
        $match: {},
      },
    ]);
    return res.json({ results: methods });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const getMyDeliveriesHistory = async (req, res) => {
  try {
    const methods = await Delivery.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "artdistributionevents",
          foreignField: "_id",
          localField: "event",
          as: "event",
        },
      },
      // {
      //   $addFields: {
      //     phoneNumber:
      //   },
      // },
    ]);
    return res.json({ results: methods });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const createDelivery = async (req, res) => {
  try {
    const value = await deliveryValidator(req.body);
    const delivery = new Delivery(value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const updateDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      throw {
        status: 404,
        message: "Delivery not Found!",
      };
    const value = await deliveryValidator(req.body);
    delivery = merge(delivery, value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const deliveryAction = async (req, res) => {
  try {
    const data = req.body;
    let delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      throw {
        status: 404,
        message: "Delivery not found!",
      };
    if (Boolean(delivery.status) && delivery.status !== "pending")
      throw {
        status: 403,
        message: "Action not surported!",
      };
    data.order = delivery.order.toString();
    if (delivery.dispencedBy) {
      data.dispencedBy = delivery.dispencedBy.toString();
    }
    data.deliveredBy = delivery.deliveredBy.toString();
    if (req.params.action === "start") {
      data.status = "pending";
    }
    if (req.params.action === "end") {
      data.status = "delivered";
    }
    const value = await deliveryValidator(data);
    delivery = merge(delivery, value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const getDeliveryDetail = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate(
    // "dispencedBy",
    // "deliveredBy",
    [
      {
        path: "order",
        model: "DeliveryServiceRequest",
        select:
          "patient deliveryAddress deliveryTimeSlot deliveryMode phoneNumber",
      },
      {
        path: "deliveredBy",
        model: "User",
        select: "username email phoneNumber image",
      },
      {
        path: "dispencedBy",
        model: "User",
        select: "username email phoneNumber image",
      },
    ]
  );
  if (!delivery) {
    return res.status(404).json({ detail: "Delivery  not found" });
  }
  return res.json(delivery);
};
module.exports = {
  getDeliveries,
  getMyDeliveriesHistory,
  createDelivery,
  updateDelivery,
  deliveryAction,
  getDeliveryDetail,
};
