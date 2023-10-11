const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const {
  deliveryMethodValidator,
} = require("../validators");
const DeliveryMethod = require("../models/DeliveryMethod");

const getDeliveryMethods = async (req, res) => {
  const methods = await DeliveryMethod.find();
  return res.json({ results: methods });
};

const getDeliveryMethodDetail = async (req, res) => {
  const method = await DeliveryMethod.findById(req.params.id);
  if (!method) {
    return res.status(404).json({ detail: "Delivery method  not found" });
  }
  return res.json(method);
};

const createDeliveryMethod = async (req, res) => {
  try {
    const value = await deliveryMethodValidator(req.body);
    const method = new DeliveryMethod(value);
    await method.save();
    return res.json(method);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const updateDeliveryMethod = async (req, res) => {
  try {
    const method = await DeliveryMethod.findById(req.params.id);
    if (!method) {
      throw {
        status: 404,
        message: "Delivery methods Not found!",
      };
    }
    const value = await deliveryMethodValidator(req.body);
    method.name = value.name;
    method.description = value.description;
    method.blockOnTimeSlotFull = value.blockOnTimeSlotFull;
    await method.save();
    return res.json(method);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
module.exports = {
  getDeliveryMethods,
  getDeliveryMethodDetail,
  createDeliveryMethod,
  updateDeliveryMethod
};
