const Joi = require("joi");

const modeSchema = Joi.object({
  name: Joi.string().required().label("Delivery Mode"),
});

const timeSlotSchema = Joi.object({
  startTime: Joi.date().required().label("Start time"),
  endTime: Joi.date().required().label("End Time"),
  capacity: Joi.number().required().label("Capacity"),
  label: Joi.string().required().label("Label"),
});

exports.modeValidator = async (data) => {
  return modeSchema.validateAsync(data, { abortEarly: false });
};
exports.timeSlotValidator = async (data) => {
  return timeSlotSchema.validateAsync(data, { abortEarly: false });
};
