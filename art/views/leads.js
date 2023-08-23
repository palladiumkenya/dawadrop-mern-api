const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const ARTModel = require("../models/ARTModel");
const { merge } = require("lodash");
const { leadsValidator } = require("../validators");
const DistributionEvent = require("../models/DistributionEvent");

const getARTCommunityLeads = async (req, res) => {
  const leads = await DistributionEvent.find();
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
    const lead = await DistributionEvent.findById(leadId);
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
    let lead = await DistributionEvent.findById(leadId);
    if (!lead)
      throw {
        status: 404,
        message: "ART Community Lead Not found",
      };
    const values = await leadsValidator(req.body);
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
    const lead = new DistributionEvent(values);
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
