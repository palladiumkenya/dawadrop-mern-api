const { Types } = require("mongoose");
const {
  getValidationErrrJson,
  parseQueryValues,
  constructFilter,
} = require("../../utils/helpers");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { treatmentSurportValidator } = require("../validators");
const User = require("../../auth/models/User");
const { pick } = require("lodash");
// todo Remove code duplication

const validateAsociation = async (body, update) => {
  const value = await treatmentSurportValidator(body);
  const { careGiver, careReceiver } = value;
  if (careGiver && careReceiver && careGiver === careReceiver)
    throw {
      status: 403,
      message:
        "Invalid Operation.Care giver must not be same with carereceiver",
    };
  if (
    careGiver &&
    (!Types.ObjectId.isValid(careGiver) || !(await User.findById(careGiver)))
  )
    throw {
      details: [{ path: ["careGiver"], message: "Invalid Care giver" }],
    };
  if (
    careReceiver &&
    (!Types.ObjectId.isValid(careReceiver) ||
      !(await Patient.findById(careReceiver)))
  )
    throw {
      details: [{ path: ["careReceiver"], message: "Invalid Care receiver" }],
    };
  if (!update && careGiver && careReceiver) {
    if (await TreatmentSurport.findOne({ careGiver, careReceiver }))
      throw {
        status: 403,
        message: "Invalid Operation.Relationship already exist",
      };
  }
  if (
    careGiver &&
    careReceiver &&
    (await Patient.findOne({ _id: careReceiver })).user.equals(careGiver)
  )
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
      ...pick(req.body, ["canPickUpDrugs", "canOrderDrug"]),
      careReceiver: (
        await Patient.findOne({ user: req.user._id })
      )._id.toString(),
    });
    const asociation = new TreatmentSurport({ ...value, owner: "receiver" });
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
      ...pick(req.body, ["canPickUpDrugs", "canOrderDrug"]),
      careGiver: req.user._id.toString(),
    });
    const asociation = new TreatmentSurport({ ...value, owner: "giver" });
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
  // const customeFilters = parseQueryValues(
  //   pick(req.query, ["onlyCareGiver", "onlyCareReceivers"])
  // );
  // console.log(
  //   Object.entries(customeFilters).map((entry) =>
  //     entry[0] === "onlyCareGiver" ? {} : {}
  //   )
  // );
  const filters = constructFilter(req.query, [
    "careGiver",
    "canOrderDrug",
    "canPickUpDrugs",
    "careReceiver",
    "_id",
  ]);
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
      // add filters
      filters,
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
const getAssociationDetail = async (req, res) => {
  try {
    const id = req.params.id;
    if (!Types.ObjectId.isValid(id))
      throw {
        status: 404,
        message: "Treatment surporter not found!",
      };
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
      // add filters
      {
        $match: {
          _id: new Types.ObjectId(id),
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
    ]);
    if (associations.length === 0)
      throw {
        status: 404,
        message: "Treatment surporter not found!",
      };
    return res.json(associations[0]);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const acceptAssociation = async (req, res) => {
  try {
    const id = req.params.id;
    if (
      !Types.ObjectId.isValid(id) ||
      !(await TreatmentSurport.findOne({ _id: id }))
    )
      throw {
        status: 404,
        message: "Treatment surporter not found!",
      };
    const asociation = await TreatmentSurport.findOne({ _id: id });
    if (asociation.careGiver && asociation.careReceiver)
      throw {
        status: 403,
        message: "Invalid operation!",
      };
    const care = {};

    if (!asociation.careGiver) {
      care.careGiver = req.user._id.toString();
    } else {
      care.careGiver = asociation.careGiver.toString();
    }
    if (!asociation.careReceiver) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient)
        throw {
          status: 403,
          message: "Invalid Operation!",
        };
      care.careReceiver = patient._id.toString();
    } else {
      care.careReceiver = asociation.careReceiver.toString();
    }
    await validateAsociation(care);
    asociation.careGiver = care.careGiver;
    asociation.careReceiver = care.careReceiver;
    await asociation.save();
    return res.json(await asociation.populate("careReceiver careGiver"));
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
  getAssociationDetail,
  acceptAssociation,
};
