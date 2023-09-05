const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const { eventsValidator } = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");
const ARTDistributionGroup = require("../models/ARTDistributionGroup");
const fetchAndScheduleEventsNortification = require("../fetchAndScheduleEventsNortification");
const ARTDistributionGroupEnrollment = require("../models/ARTDistributionGroupEnrollment");
const ARTDistributionEventFeedBack = require("../models/ARTDistributionEventFeedBack");
const Patient = require("../../patients/models/Patient");

const getARTDistributionEvents = async (req, res) => {
  const user = req.user._id;
  const event = await ARTDistributionEvent.aggregate([
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
        from: "patients",
        foreignField: "_id",
        localField: "subscriptions.patient",
        as: "patientSubscribers",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "patientSubscribers.user",
        as: "subscribers",
      },
    },
    {
      $match: {
        $or: [
          { "subscribers._id": user, "subscriptions.isCurrent": true }, //currentlyEnrolledInCurrentGroup
          { "group.lead.user": user }, // isLeaderOfCurrentGroup
        ],
      },
    },
    {
      $lookup: {
        from: "artdistributioneventfeedbacks",
        foreignField: "event",
        localField: "_id",
        as: "feedBacks",
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
        from: "users",
        foreignField: "_id",
        localField: "group.lead.user",
        as: "leadUser",
      },
    },
    { $addFields: { extraSubscribers: "$group.extraSubscribers" } },
    {
      $project: {
        subscriptions: {
          group: 0,
          __v: 0,
        },
        subscribers: {
          __v: 0,
          password: 0,
          roles: 0,
          lastLogin: 0,
        },
        group: {
          lead: 0,
          extraSubscribers: 0,
        },
      },
    },
  ]);
  return res.json({
    viewer: {
      isLead: await req.user.isGroupLead(),
    },
    results: event,
  });
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
    const { group, distributionLocation } = values;
    const { latitude, longitude, address } = distributionLocation;

    const _group = await ARTDistributionGroup.findById(group);
    const errors = [];
    if (!_group)
      errors.push({ path: ["group"], message: "Invalid ART Community group" });
    if (!address && !(longitude && latitude))
      errors.push({
        path: ["distributionLocation"],
        message: "Distribution venue is required",
      });
    if (errors.length > 0)
      throw {
        details: errors,
      };
    event = merge(event, { ...values, group: _group });
    await event.save();
    fetchAndScheduleEventsNortification();
    return res.json(event);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createARTDistributionEvent = async (req, res) => {
  try {
    const values = await eventsValidator(req.body);
    const { group, distributionLocation } = values;
    const { latitude, longitude, address } = distributionLocation;

    const _group = await ARTDistributionGroup.findById(group);
    const errors = [];
    if (!_group)
      errors.push({ path: ["group"], message: "Invalid ART Community group" });
    if (!address && !(longitude && latitude))
      errors.push({
        path: ["distributionLocation"],
        message: "Distribution venue is required",
      });
    if (errors.length > 0)
      throw {
        details: errors,
      };
    const event = new ARTDistributionEvent({ ...values, group: _group });
    await event.save();
    fetchAndScheduleEventsNortification();
    return res.json(event);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const confirmEventAttendance = async (req, res) => {
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
    const patient = await Patient.findOne({ user: req.user._id });
    const enrolment = await ARTDistributionGroupEnrollment.findOne({
      group: event.group,
      patient: patient._id,
      isCurrent: true,
    });
    if (!enrolment)
      throw {
        status: 403,
        message: "Fobbiddden.You are not actively subscribed to that event",
      };

    // get or create feedback
    let feedBack = await ARTDistributionEventFeedBack.findOne({
      event: eventId,
      user: req.user._id,
    });
    if (feedBack) {
      feedBack.confirmedAttendance = true;
      delete feedBack.deliveryRequest;
      await feedBack.save();
    } else {
      feedBack = await ARTDistributionEventFeedBack({
        event,
        user: req.user._id,
        confirmEventAttendance: true,
      });
      await feedBack.save();
    }
    return res.json({ detail: "Confirmed successfull!" });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const fullFillEventDeliveryRequest = async (req, res) => {
  const feedBackId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(feedBackId))
      throw {
        status: 404,
        message: "Event FeedBack not found",
      };
    let event = await ARTDistributionEventFeedBack.findById(feedBackId);
    if (!event)
      throw {
        status: 404,
        message: "Event FeedBack not found",
      };

    const enrolment = await ARTDistributionGroupEnrollment.findOne({
      group: event.group,
      user: req.user._id,
      isCurrent: true,
    });
    if (!enrolment)
      throw {
        status: 403,
        message: "Fobbiddden.You are not actively subscribed to that event",
      };

    // get or create feedback
    let feedBack = await ARTDistributionEventFeedBack.findOne({
      event: feedBackId,
      user: req.user._id,
    });
    if (feedBack) {
      feedBack.confirmedAttendance = true;
      delete feedBack.deliveryRequest;
      await feedBack.save();
    } else {
      feedBack = await ARTDistributionEventFeedBack({
        event,
        user: req.user._id,
        confirmEventAttendance: true,
      });
      await feedBack.save();
    }
    return res.json({ detail: "Confirmed successfull!" });
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
  confirmEventAttendance,
};
