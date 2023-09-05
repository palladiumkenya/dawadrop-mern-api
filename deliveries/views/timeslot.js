const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge } = require("lodash");
const {  timeSlotValidator } = require("../validators");
const TimeSlot = require("../models/TimeSlot");

const getTimeSlots = async (req, res) => {
  const timeSlotes = await TimeSlot.find();
  return res.json({ results: timeSlotes });
};

const getTimeSlotDetail = async (req, res) => {
  const timeSlot = await TimeSlot.findById(req.params.id);
  if (!timeSlot) {
    return res.status(404).json({ detail: "Delivery TimeSlot  not found" });
  }
  return res.json(timeSlot);
};

const createTimeSlot = async (req, res) => {
  try {
    const value = await timeSlotValidator(req.body);
    const timeSlote = new TimeSlot(value);
    await timeSlote.save();
    return res.json(timeSlote);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const updateTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      throw {
        status: 404,
        message: "Delivery TimeSlot Not found!",
      };
    }
    const value = await timeSlotValidator(req.body);
    timeSlot.label = value.label;
    timeSlot.startTime = value.startTime;
    timeSlot.endTime = value.endTime;
    timeSlot.capacity = value.capacity;
    await timeSlot.save();
    return res.json(timeSlot);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};
module.exports = {
  getTimeSlots,
  getTimeSlotDetail,
  createTimeSlot,
  updateTimeSlot,
};
