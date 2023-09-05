const { Types } = require("mongoose");
const {
  getValidationErrrJson,
  parseQueryValues,
  constructFilter,
  constructSearch,
} = require("../../utils/helpers");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { treatmentSurportValidator } = require("../validators");
const User = require("../../auth/models/User");
const { pick, merge } = require("lodash");
// todo Remove code duplication

const findPatient = async (req, res) => {
  const search = req.query.search;
  const searchFields = [
    "_id",
    "username",
    "email",
    "firstName",
    "lastName",
    "phoneNumber",
    "isActive",
    "roles",
  ];
  const patients = await Patient.aggregate([
    constructFilter(
      req.query,
      [
        "_id",
        "user",
        "cccNumber",
        "upiNumber",
        "nationalId",
        "firstName",
        "lastName",
        "surName",
        "gender",
        "phoneNumber",
        "stable",
      ],
      ["phoneNumber", "cccNumber"]
    ),
    constructSearch(
      search,
      [
        "_id",
        "user",
        "cccNumber",
        "upiNumber",
        "nationalId",
        "firstName",
        "lastName",
        "surName",
        "gender",
        "phoneNumber",
        "stable",
      ],
      ["phoneNumber", "cccNumber"]
    ),
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "user",
        as: "user",
      },
    },
    {
      $project: {
        user: {
          password: 0,
        },
      },
    },
  ]);
  res.json({ results: patients });
};

module.exports = { findPatient };
