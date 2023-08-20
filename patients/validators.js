const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const profileShema = Joi.object({
  cccNumber: Joi.string().required().label("CCC Number"),
  upiNo: Joi.string().label("Universal Patient Number").allow(""),
  firstName: Joi.string().required().label("First Name"),
});
const deliveryFeedBackSchema = Joi.object({
  delivery: Joi.string()
    .required()
    .label("Delivery")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  review: Joi.string().label("Review").required(),
  rating: Joi.number().required().label("Rating").max(5).min(1),
});
const treatmentSurportSchema = Joi.object({
  careGiver: Joi.string().label("Care giver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  careReceiver: Joi.string().label("Care Receiver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  canPickUpDrugs: Joi.bool().label("Can pick up drugs?"),
  canOrderDrug: Joi.bool().label("Can order drugs?"),
});

module.exports.profileValidator = async (data) => {
  return await profileShema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.deliveryFeedBackValidator = async (data) => {
  return await deliveryFeedBackSchema.validateAsync(
    cleanFalsyAttributes(data),
    {
      abortEarly: false,
    }
  );
};

module.exports.treatmentSurportValidator = async (data) => {
  return await treatmentSurportSchema.validateAsync(
    cleanFalsyAttributes(data),
    {
      abortEarly: false,
    }
  );
};
