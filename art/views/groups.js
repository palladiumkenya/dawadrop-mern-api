const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const {
  eventsValidator,
  groupsValidator,
  groupsMemberShipValidator,
} = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");
const ARTDistributionGroup = require("../models/ARTDistributionGroup");
const User = require("../../auth/models/User");
const ARTDistributionGroupEnrollment = require("../models/ARTDistributionGroupEnrollment");

const getARTDistributionGroups = async (req, res) => {
  const user = req.user._id;
  const group = await ARTDistributionGroup.aggregate([
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "lead.user",
        as: "leadUser",
      },
    },
    {
      $lookup: {
        from: "artdistributionmodels",
        foreignField: "_id",
        localField: "lead.artModel",
        as: "artModel",
      },
    },
    {
      $lookup: {
        from: "artdistributiongroupenrollments",
        foreignField: "group._id",
        localField: "_id",
        as: "enrollments",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "enrollments.user",
        as: "enrolledUsers",
      },
    },
    {
      $match: {
        $or: [
          { "lead.user": user }, // curr user is the lead to curr group
          { "enrollments.user": user, "enrollments.isCurrent": true }, // curr user is the lead to curr group
        ],
      },
    },
    {$project: {
      enrolledUsers: {
        __v:0,
        password: 0,
        roles: 0,
        lastLogin: 0
      },
      enrollments: 0
    }}
  ]);
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
    const _lead = await ARTDistributionGroupLead.findOne({
      user: req.user._id,
    });
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
    const _lead = await ARTDistributionGroupLead.findOne({
      user: req.user._id,
    });
    const group = new ARTDistributionGroup({ ...values, lead: _lead });
    await group.save();
    return res.json(group);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const addNewMemberToARTDistributionGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    if (!Types.ObjectId.isValid(groupId))
      throw { status: 404, message: "ART Distribution group not found" };
    const group = await ARTDistributionGroup.findById(groupId);
    if (!group)
      throw { status: 404, message: "ART Distribution group not found" };
    const values = await groupsMemberShipValidator(req.body);
    const { paticipant } = values;
    // 1.Check if user exists
    const user = await User.findById(paticipant);
    if (!user) throw { status: 404, message: "Paticipant is not a valid user" };
    // 2. Check if paticipant is already in group
    const enrolments = await ARTDistributionGroupEnrollment.findOne({
      user: user._id,
      isCurrent: true,
    });
    if (enrolments)
      throw {
        status: 403,
        message: "Paticipant already enroled in another group",
      };
    // 3. Check if user is a group lead
    const groupLead = await ARTDistributionGroupLead.findOne({
      user: user._id,
    });
    if (groupLead)
      throw {
        status: 403,
        message: "Paticipant is a group lead",
      };
    const enrol = new ARTDistributionGroupEnrollment({
      user: user._id,
      isCurrent: true,
      group: group,
    });
    await enrol.save();
    return res.json(enrol);
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
  addNewMemberToARTDistributionGroup,
};
