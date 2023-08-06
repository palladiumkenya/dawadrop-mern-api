const Joi = require("joi");

const profileShema = Joi.object({
  cccNumber: Joi.string().required().label("CCC Number"),
  upiNo: Joi.string().label("Universal Patient Number").allow(""),
  firstName: Joi.string().required().label("First Name"),
});
const deliveryFeedBackSchema = Joi.object({
  delivery: Joi.string().required().label("Delivery"),
  review: Joi.string().label("Review").required(),
  rating: Joi.number().required().label("Rating").max(5).min(1),
});

module.exports.profileValidator = async (data) => {
  return await profileShema.validateAsync(data, { abortEarly: false });
};
module.exports.deliveryFeedBackValidator = async (data) => {
  return await deliveryFeedBackSchema.validateAsync(data, {
    abortEarly: false,
  });
};
