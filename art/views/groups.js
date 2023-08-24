const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const { eventsValidator, groupsValidator } = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");
const ARTDistributionGroup = require("../models/ARTDistributionGroup");

const getARTDistributionGroups = async (req, res) => {
  const group = await ARTDistributionGroup.find();
  return res.json({ results: group });
};

const getARTDistributionGruopDetail = async (req, res) => {
  const groupId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(groupId))
      throw {
        status: 404,
        message: "ART Distribution Group not found",
      };
    const group = await ARTDistributionGroup.findById(groupId);
    if (!group)
      throw {
        status: 404,
        message: "ART Distribution Group not found",
      };
    return res.json(group);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateARTDistributionGroup = async (req, res) => {
  const groupId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(groupId))
      throw {
        status: 404,
        message: "ART Distribution Group not found",
      };
    let group = await ARTDistributionGroup.findById(groupId);
    if (!group)
      throw {
        status: 404,
        message: "ART Distribution Group not found",
      };
    const values = await groupsValidator(req.body);
    const { lead } = values;
    const _lead = await ARTDistributionGroupLead.findById(lead);
    if (!_lead)
      throw {
        details: [{ path: ["lead"], message: "Invalid ART Community lead" }],
      };
    group = merge(group, { ...values, lead: _lead });
    await group.save();
    return res.json(group);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createARTDistributionGroup = async (req, res) => {
  try {
    const values = await groupsValidator(req.body);
    const { lead } = values;
    const _lead = await ARTDistributionGroupLead.findById(lead);
    if (!_lead)
      throw {
        details: [{ path: ["lead"], message: "Invalid ART Community lead" }],
      };
    const group = new ARTDistributionGroup({ ...values, lead: _lead });
    await group.save();
    return res.json(group);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getARTDistributionGruopDetail,
  getARTDistributionGroups,
  updateARTDistributionGroup,
  createARTDistributionGroup,
};
