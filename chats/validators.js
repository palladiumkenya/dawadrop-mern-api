const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const chatSchema = Joi.object({
  messageType: Joi.string()
    .valid("image", "text")
    .label("Message Type")
    .required(),
  message: Joi.string().required().label("Message"),
  sender: Joi.string().required().label("Sender").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
});

exports.chatValidator = async (data) => {
  return await chatSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
