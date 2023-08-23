const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const { eventsValidator } = require("../validators");
const ARTDistributionEvent = require("../models/ARTDistributionEvent");
const ARTDistributionGroupLead = require("../models/ARTDistributionGroupLead");

const getARTDistributionEvents = async (req, res) => {
  const event = await ARTDistributionEvent.find();
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
    const { lead } = values;
    const _lead = await ARTDistributionGroupLead.findById(lead);
    if (!_lead)
      throw {
        details: [{ path: ["lead"], message: "Invalid ART Community lead" }],
      };
    event = merge(event, { ...values, lead: _lead });
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
    const { lead } = values;
    const _lead = await ARTDistributionGroupLead.findById(lead);
    if (!_lead)
      throw {
        details: [{ path: ["lead"], message: "Invalid ART Community lead" }],
      };
    const event = new ARTDistributionEvent({ ...values, lead: _lead });
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
