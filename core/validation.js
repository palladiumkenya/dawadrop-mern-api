const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const smsConfigSchema = Joi.object({
  name: Joi.string().required().label("SMS Config name"),
  description: Joi.string().label("SMS Config description"),
  smsTemplate: Joi.string().required().label("SMS Template"),
  smsType: Joi.string().required().label("SMS Type").valid("EVENT_REMINDER"),
});

module.exports.validateSmsConfig = async (data) => {
  return smsConfigSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
