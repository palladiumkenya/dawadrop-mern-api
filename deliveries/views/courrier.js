const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const CourrierService = require("../models/CourrierService");
const { courrierServicesValidator } = require("../validators");

const getCourrierServices = async (req, res) => {
  try {
    const service = await CourrierService.find();
    return res.json({ results: service });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const getCourrierServicesDetail = async (req, res) => {
  const serviceId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(serviceId))
      throw {
        status: 404,
        message: "Courrier service not found",
      };
    const service = await CourrierService.findById(serviceId);
    if (!service)
      throw {
        status: 404,
        message: "Courrier service not found",
      };
    return res.json(service);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateCourrierServices = async (req, res) => {
  const serviceId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(serviceId))
      throw {
        status: 404,
        message: "Courrier service not found",
      };
    let service = await CourrierService.findById(serviceId);
    if (!service)
      throw {
        status: 404,
        message: "Courrier service not found",
      };
    const values = await courrierServicesValidator(req.body);
    service = merge(service, values);
    await service.save();
    return res.json(service);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createCourrierServices = async (req, res) => {
  try {
    const values = await courrierServicesValidator(req.body);
    const service = new CourrierService(values);
    await service.save();
    return res.json(service);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getCourrierServicesDetail,
  getCourrierServices,
  updateCourrierServices,
  createCourrierServices,
};
