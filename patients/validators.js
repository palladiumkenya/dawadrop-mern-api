const Joi = require("joi");

const profileShema = Joi.object({
  cccNumber: Joi.string().required().label("CCC Number"),
  upiNo: Joi.string().label("Universal Patient Number"),
  firstName: Joi.string().required().label("First Name"),
});

module.exports.profileValidator = async (data) => {
  return await profileShema.validateAsync(data);
};
