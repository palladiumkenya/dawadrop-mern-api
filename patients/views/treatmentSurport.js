const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { treatmentSurportValidator } = require("../validators");
const User = require("../../auth/models/User");
// todo Remove code duplication

const validateAsociation = async (body) => {
  const value = await treatmentSurportValidator(body);
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
  return value;
};
const createAssociation = async (req, res) => {
  try {
    const value = await validateAsociation(req.body);
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const updateAssociation = async (req, res) => {
  try {
    const value = await validateAsociation(req.body);
    const asociation = await TreatmentSurport.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const addCareGiver = async (req, res) => {
  // for patients
  try {
    const value = await validateAsociation({
      ...req.body,
      careReceiver: (
        await Patient.findOne({ user: req.user._id })
      )._id.toString(),
    });
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const updateCareGiver = async (req, res) => {
  // for patients
  try {
    if (
      !Types.ObjectId.isValid(req.params.id) ||
      !(await TreatmentSurport.findById(req.params.id))
    )
      throw {
        status: 404,
        message: "No treament surporter",
      };
    const value = await validateAsociation({
      ...req.body,
      careReceiver: (
        await Patient.findOne({ user: req.user._id })
      )._id.toString(),
    });
    const asociation = await TreatmentSurport.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const addCareReceiver = async (req, res) => {
  try {
    const value = await validateAsociation({
      ...req.body,
      careGiver: req.user._id.toString(),
    });
    const asociation = new TreatmentSurport(value);
    await asociation.save();
    return res.json(await asociation.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
const updateCareReceiver = async (req, res) => {
  try {
    if (
      !Types.ObjectId.isValid(req.params.id) ||
      !(await TreatmentSurport.findById(req.params.id))
    )
      throw {
        status: 404,
        message: "No treament surporter",
      };
    const value = await validateAsociation({
      ...req.body,
      careGiver: req.user._id.toString(),
    });
    const asociation = await TreatmentSurport.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
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
const searchAssociations = async (req, res) => {
  // require privilges
  try {
    const q = req.query.q; //cccNo or patient id as receiver or user id as giver or receiver
    const associations = await TreatmentSurport.aggregate([
      {
        $lookup: {
          from: "patients",
          foreignField: "_id",
          localField: "careReceiver",
          as: "patient",
        },
      },
      // {
      //   $match: {
      //     $or: [{ careGiver: "" }, { careReceiver: "" }],
      //   },
      // },
    ]);
    return res.json({ results: associations });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = {
  getAssociations,
  createAssociation,
  updateAssociation,
  addCareGiver,
  updateCareGiver,
  addCareReceiver,
  updateCareReceiver,
  searchAssociations,
};
