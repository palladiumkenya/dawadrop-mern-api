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
const deliveryMethodSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  description: Joi.string().label("Description"),
  blockOnTimeSlotFull: Joi.bool().label("Block when slot is full"),
});

exports.modeValidator = async (data) => {
  return modeSchema.validateAsync(data, { abortEarly: false });
};
exports.timeSlotValidator = async (data) => {
  return timeSlotSchema.validateAsync(data, { abortEarly: false });
};
exports.deliveryMethodValidator = async (data) => {
  return deliveryMethodSchema.validateAsync(data, { abortEarly: false });
};
