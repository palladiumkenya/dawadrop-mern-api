const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const { eventsValidator } = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");
const ARTDistributionGroup = require("../models/ARTDistributionGroup");

const getARTDistributionEvents = async (req, res) => {
  const user = req.user._id;
  const event = await ARTDistributionEvent.aggregate([
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "group.lead.user",
        as: "leadUser",
      },
    },
    {
      $lookup: {
        from: "artdistributionmodels",
        foreignField: "_id",
        localField: "group.lead.artModel",
        as: "artModel",
      },
    },
    {
      $lookup: {
        from: "artdistributiongroupenrollments",
        foreignField: "group._id",
        localField: "group._id",
        as: "subscriptions",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriptions.user",
        as: "subscribers",
      },
    },
    {
      $match: {
        $or: [
          { "subscriptions.user": user, "subscriptions.isCurrent": true }, //currentlyEnrolledInCurrentGroup
          { "group.lead.user": user }, // isLeaderOfCurrentGroup
        ],
      },
    },
    {
      $project: {
        subscriptions: 0,
        subscribers: {
          __v: 0,
          password: 0,
          roles: 0,
          lastLogin: 0,
        },
      },
    },
  ]);
  return res.json({ results: event });
};

const getARTDistributionEventDetail = async (req, res) => {
  const eventId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(eventId))
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    const event = await ARTDistributionEvent.findById(eventId);
    if (!event)
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    return res.json(event);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateARTDistributionEvent = async (req, res) => {
  const eventId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(eventId))
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    let event = await ARTDistributionEvent.findById(eventId);
    if (!event)
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    const values = await eventsValidator(req.body);
    const { group } = values;
    const _group = await ARTDistributionGroup.findById(group);
    if (!_group)
      throw {
        details: [{ path: ["group"], message: "Invalid ART Community group" }],
      };
    event = merge(event, { ...values, group: _group });
    await event.save();
    return res.json(event);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createARTDistributionEvent = async (req, res) => {
  try {
    const values = await eventsValidator(req.body);
    const { group } = values;
    const _group = await ARTDistributionGroup.findById(group);
    if (!_group)
      throw {
        details: [{ path: ["group"], message: "Invalid ART Community group" }],
      };
    const event = new ARTDistributionEvent({ ...values, group: _group });
    await event.save();
    return res.json(event);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getARTDistributionEventDetail,
  getARTDistributionEvents,
  updateARTDistributionEvent,
  createARTDistributionEvent,
};
