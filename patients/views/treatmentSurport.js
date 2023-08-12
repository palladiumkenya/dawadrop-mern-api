const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { treatmentSurportValidator } = require("../validators");
const User = require("../../auth/models/User");
const { json } = require("express");
// todo Remove code duplication
const createAssociation = async (req, res) => {
  try {
    const value = await treatmentSurportValidator(req.body);
    const { careGiver, careReceiver } = value;
    if (careGiver === careReceiver)
      throw {
        status: 403,
        message:
          "Invalid Operation.Care giver must not be same with carereceiver",
      };
    if (!Types.ObjectId.isValid(careGiver) || !(await User.findById(careGiver)))
      throw {
        details: [{ path: ["careGiver"], message: "Invalid Care giver" }],
      };
    if (
      !Types.ObjectId.isValid(careReceiver) ||
      !(await Patient.findById(careReceiver))
    )
      throw {
        details: [{ path: ["careReceiver"], message: "Invalid Care receiver" }],
      };
    if (await TreatmentSurport.findOne({ careGiver, careReceiver }))
      throw {
        status: 403,
        message: "Invalid Operation.Relationship already exist",
      };
    if ((await Patient.findOne({ _id: careReceiver })).user.equals(careGiver))
      throw {
        status: 403,
        message: "Invalid Operation.Cant care give yourself",
      };
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const addCareGiver = async (req, res) => {
  try {
    const value = await treatmentSurportValidator({
      ...req.body,
      careReceiver: req.user._id,
    });
    const { careGiver, careReceiver } = value;
    if (careGiver === careReceiver)
      throw {
        status: 403,
        message:
          "Invalid Operation.Care giver must not be same with carereceiver",
      };
    if (!Types.ObjectId.isValid(careGiver) || !(await User.findById(careGiver)))
      throw {
        details: [{ path: ["careGiver"], message: "Invalid Care giver" }],
      };
    if (
      !Types.ObjectId.isValid(careReceiver) ||
      !(await Patient.findById(careReceiver))
    )
      throw {
        details: [{ path: ["careReceiver"], message: "Invalid Care receiver" }],
      };
    if (await TreatmentSurport.findOne({ careGiver, careReceiver }))
      throw {
        status: 403,
        message: "Invalid Operation.Relationship already exist`",
      };
    if ((await Patient.findOne({ _id: careReceiver })).user.equals(careGiver))
      throw {
        status: 403,
        message: "Invalid Operation.Cant care give yourself",
      };
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const addCareReceiver = async (req, res) => {
  try {
    const value = await treatmentSurportValidator({
      ...req.body,
      careGiver: req.user._id,
    });
    const { careGiver, careReceiver } = value;
    if (careGiver === careReceiver)
      throw {
        status: 403,
        message:
          "Invalid Operation.Care giver must not be same with carereceiver",
      };
    if (!Types.ObjectId.isValid(careGiver) || !(await User.findById(careGiver)))
      throw {
        details: [{ path: ["careGiver"], message: "Invalid Care giver" }],
      };
    if (
      !Types.ObjectId.isValid(careReceiver) ||
      !(await Patient.findById(careReceiver))
    )
      throw {
        details: [{ path: ["careReceiver"], message: "Invalid Care receiver" }],
      };
    if (await TreatmentSurport.findOne({ careGiver, careReceiver }))
      throw {
        status: 403,
        message: "Invalid Operation.Relationship already exist`",
      };
    if ((await Patient.findOne({ _id: careReceiver })).user.equals(careGiver))
      throw {
        status: 403,
        message: "Invalid Operation.Cant care give yourself",
      };
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const getAssociations = async (req, res) => {
  try {
    const user = req.user._id;
    const patient = await Patient.findOne({ user });
    const associations = await TreatmentSurport.find()
      .or([{ careGiver: user }, { careReceiver: patient?._id }])
      .populate("careGiver careReceiver");
    return res.json({ results: associations });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = {
  getAssociations,
  createAssociation,
  addCareGiver,
  addCareReceiver,
};
