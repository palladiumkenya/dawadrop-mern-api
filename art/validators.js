const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const artModelSchema = Joi.object({
  name: Joi.string().required().label("Model Name"),
  description: Joi.string().label("Model Description"),
  modelCode: Joi.string().required().label("Model code"),
});
const leadSchema = Joi.object({
  user: Joi.string().required().label("User").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  artModel: Joi.string()
    .label("ART Community")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
});
const eventSchema = Joi.object({
  title: Joi.string().required().label("Event Title"),
  lead: Joi.string()
    .label("Community Lead")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  distributionTime: Joi.date().label("Distribution time").required(),
  distributionLocation: Joi.object({
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Distribution Location")
    .required(),
  remarks: Joi.string().label("Remarks"),
});

module.exports.artModelValidator = async (data) => {
  return await artModelSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.leadsValidator = async (data) => {
  return await leadSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.eventsValidator = async (data) => {
  return await eventSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
