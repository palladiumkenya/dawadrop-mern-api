const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { treatmentSurportValidator } = require("../validators");
const User = require("../../auth/models/User");
// todo Remove code duplication

const validateAsociation = async (body, update) => {
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
  if (!update) {
    if (await TreatmentSurport.findOne({ careGiver, careReceiver }))
      throw {
        status: 403,
        message: "Invalid Operation.Relationship already exist",
      };
  }
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
    const value = await validateAsociation(req.body, true);
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
    const associations = await TreatmentSurport.aggregate([
      // Lookup patientCareReceiver details
      {
        $lookup: {
          from: "patients",
          foreignField: "_id",
          localField: "careReceiver",
          as: "patientCareReceiver",
        },
      },
      // Lookup userCareReceiver details
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "patientCareReceiver.user",
          as: "userCareReceiver",
        },
      },
      // Lookup userCareGiver details
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "careGiver",
          as: "userCareGiver",
        },
      },
      // Lookup patientCareGiver details
      {
        $lookup: {
          from: "patients",
          foreignField: "user",
          localField: "userCareGiver._id",
          as: "patientCareGiver",
        },
      },
      // Match documents based on various conditions
      {
        $match: {
          $or: [
            { "userCareReceiver._id": user }, // look by patient user id
            { careGiver: user }, // look by user id (caregiver)
          ],
        },
      },
    ]);
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
    const _id = Types.ObjectId.isValid(q) ? new Types.ObjectId(q) : undefined;
    const associations = await TreatmentSurport.aggregate([
      // Lookup patientCareReceiver details
      {
        $lookup: {
          from: "patients",
          foreignField: "_id",
          localField: "careReceiver",
          as: "patientCareReceiver",
        },
      },
      // Lookup userCareReceiver details
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "patientCareReceiver.user",
          as: "userCareReceiver",
        },
      },
      // Lookup userCareGiver details
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "careGiver",
          as: "userCareGiver",
        },
      },
      // Lookup patientCareGiver details
      {
        $lookup: {
          from: "patients",
          foreignField: "user",
          localField: "userCareGiver._id",
          as: "patientCareGiver",
        },
      },
      // Match documents based on various conditions
      {
        $match: {
          $or: [
            { "patientCareGiver.cccNumber": q }, // look by patient ccc number if caregiver is a patient (e.g., mother patient to child patient)
            { "patientCareReceiver.cccNumber": q }, // look by patient ccc Number
            { careGiver: _id }, // look by user id (caregiver)
            { careReceiver: _id }, // look by patient id (care receiver)
            { _id }, // look by treatment support id
            { "patientCareGiver._id": _id }, // look by patient id if giver is a patient
            { "userCareReceiver._id": _id }, // look by patient id if giver is a patient
          ],
        },
      },
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
