const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const ARTDistributionModel = require("../models/ARTDistributionModel");
const { merge } = require("lodash");
const { leadsValidator } = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const User = require("../../auth/models/User");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");

const getARTCommunityLeads = async (req, res) => {
  const leads = await ARTDistributionGroupLead.aggregate([
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "user",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "artdistributionmodels",
        foreignField: "_id",
        localField: "artModel",
        as: "artModel",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "registeredBy",
        as: "registeredBy",
      },
    },
    {
      $project: {
        user: {
          password: 0,
        },
        registeredBy: {
          password: 0,
        },
      },
    },
  ]);
  return res.json({ results: leads });
};

const getARTCommunityLeadDetail = async (req, res) => {
  const leadId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(leadId))
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    const lead = await ARTDistributionGroupLead.findById(leadId);
    if (!lead)
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    return res.json(lead);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateARTCommunityLead = async (req, res) => {
  const leadId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(leadId))
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    let lead = await ARTDistributionGroupLead.findById(leadId);
    if (!lead)
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    const values = await leadsValidator(req.body);
    const { user, artModel } = values;
    const _user = await User.findById(user);
    const _artModel = await ARTDistributionModel.findById(artModel);
    const errors = [];
    if (!_user) errors.push({ path: ["user"], message: "Invalid User" });
    if (!_artModel)
      errors.push({ path: ["artModel"], message: "Invalid ART Model" });
    if (errors.length > 0)
      throw {
        details: errors,
      };
    lead = merge(lead, values);
    await lead.save();
    return res.json(lead);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createARTCommunityLead = async (req, res) => {
  try {
    const values = await leadsValidator(req.body);
    const { user, artModel } = values;
    const _user = await User.findById(user);
    const _artModel = await ARTDistributionModel.findById(artModel);
    const errors = [];
    if (!_user) errors.push({ path: ["user"], message: "Invalid User" });
    if (!_artModel)
      errors.push({ path: ["artModel"], message: "Invalid ART Model" });
    if (errors.length > 0)
      throw {
        details: errors,
      };
    const lead = new ARTDistributionGroupLead({
      ...values,
      registeredBy: req.user._id,
    });
    await lead.save();
    return res.json(lead);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getARTCommunityLeadDetail,
  getARTCommunityLeads,
  updateARTCommunityLead,
  createARTCommunityLead,
};
