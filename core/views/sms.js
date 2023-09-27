const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const SmsConfig = require("../models/SmsConfig");
const { validateSmsConfig } = require("../validation");
const { merge } = require("lodash");

const getSmsConfigs = async (req, res) => {
  try {
    const configs = await SmsConfig.find();
    return res.json({ results: configs });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createSmsConfig = async (req, res) => {
  try {
    const values = await validateSmsConfig(req.body);
    const config = new SmsConfig(values);
    await config.save();
    return res.json(config);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const updateSmsConfig = async (req, res) => {
  try {
    const confId = req.params.id;
    if (!Types.ObjectId.isValid(confId)) {
      throw {
        status: 404,
        message: "Sms Config not found",
      };
    }
    const conf = await SmsConfig.findById(confId);
    if (!conf)
      throw {
        status: 404,
        message: "Sms Config not found",
      };
    const values = await validateSmsConfig(req.body);
    const config = merge(conf, values);
    await config.save();
    return res.json(config);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const deleteSmsConfig = async (req, res) => {
  try {
    const confId = req.params.id;
    if (!Types.ObjectId.isValid(confId)) {
      throw {
        status: 404,
        message: "Sms Config not found",
      };
    }
    const conf = await SmsConfig.findByIdAndDelete(confId);
    if (!conf)
      throw {
        status: 404,
        message: "Sms Config not found",
      };
    return res.json(conf);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getSmsConfigs,
  createSmsConfig,
  updateSmsConfig,
  deleteSmsConfig,
};
