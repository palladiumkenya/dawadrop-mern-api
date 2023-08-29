const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const modeSchema = Joi.object({
  name: Joi.string().required().label("Delivery Mode"),
});

const timeSlotSchema = Joi.object({
  startTime: Joi.date().required().label("Start time"),
  endTime: Joi.date().required().label("End Time"),
  capacity: Joi.number().required().label("Capacity"),
  label: Joi.string().required().label("Label"),
});
const serviceSchema = Joi.object({
  name: Joi.string().required().label("Curriour Service name"),
});
const deliveryMethodSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  description: Joi.string().label("Description"),
  blockOnTimeSlotFull: Joi.bool().label("Block when slot is full"),
});
const deliverySchema = Joi.object({
  order: Joi.string()
    .required()
    .label("DeliveryServiceRequest")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string(),
  })
    .label("Location")
    .required(),
  dispencedBy: Joi.string().label("Dispenser").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  deliveredBy: Joi.string()
    .required()
    .label("Delivery Agent")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  status: Joi.string(),
  streamUrl: Joi.string().required(),
});

exports.modeValidator = async (data) => {
  return modeSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.timeSlotValidator = async (data) => {
  return timeSlotSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.deliveryMethodValidator = async (data) => {
  return deliveryMethodSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.agentDeliveryValidator = async (data) => {
  return deliveryMethodSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.deliveryValidator = async (data) => {
  return deliverySchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.courrierServicesValidator = async (data) => {
  return serviceSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
