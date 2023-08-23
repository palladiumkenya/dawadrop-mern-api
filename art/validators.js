const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const artModelSchema = Joi.object({
  name: Joi.string().required().label("Model Name"),
  description: Joi.string().label("Model Description"),
  modelCode: Joi.string().required().label("Model code"),
});

module.exports.artModelValidator = async (data) => {
  return await artModelSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
