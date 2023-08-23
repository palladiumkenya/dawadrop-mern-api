const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const ARTModel = require("../models/ARTModel");
const { merge } = require("lodash");
const { leadsValidator } = require("../validators");
const DistributionEvent = require("../models/DistributionEvent");
const User = require("../../auth/models/User");
const ARTCommunityLead = require("../models/ARTCommunityLead");

const getARTCommunityLeads = async (req, res) => {
  const leads = await ARTCommunityLead.find();
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
    const lead = await ARTCommunityLead.findById(leadId);
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
    let lead = await ARTCommunityLead.findById(leadId);
    if (!lead)
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    const values = await leadsValidator(req.body);
    const { user, artModel } = values;
    const _user = await User.findById(user);
    const _artModel = await ARTModel.findById(artModel);
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
    const _artModel = await ARTModel.findById(artModel);
    const errors = [];
    if (!_user) errors.push({ path: ["user"], message: "Invalid User" });
    if (!_artModel)
      errors.push({ path: ["artModel"], message: "Invalid ART Model" });
    if (errors.length > 0)
      throw {
        details: errors,
      };
    const lead = new ARTCommunityLead({
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
