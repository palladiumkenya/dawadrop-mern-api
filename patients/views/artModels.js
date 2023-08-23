const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const ARTModel = require("../models/ArtModel");
const { merge } = require("lodash");
const { artModelValidator } = require("../validators");

const getArtModels = async (req, res) => {
  const models = await ARTModel.find();
  return res.json({ results: models });
};

const getARTModelDetail = async (req, res) => {
  const modelId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(modelId))
      throw {
        status: 404,
        message: "ART Model not found",
      };
    const model = await ARTModel.findById(modelId);
    if (!model)
      throw {
        status: 404,
        message: "ART Model not found",
      };
    return res.json(model);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateARTModel = async (req, res) => {
  const modelId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(modelId))
      throw {
        status: 404,
        message: "ART Model not found",
      };
    let model = await ARTModel.findById(modelId);
    if (!model)
      throw {
        status: 404,
        message: "ART Model not found",
      };
    const values = await artModelValidator(req.body);
    model = merge(model, values);
    await model.save();
    return res.json(model);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createARTModel = async (req, res) => {
  try {
    const values = await artModelValidator(req.body);
    const model = new ARTModel(values);
    await model.save();
    return res.json(model);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getARTModelDetail,
  getArtModels,
  updateARTModel,
  createARTModel,
};
