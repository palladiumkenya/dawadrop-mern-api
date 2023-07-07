const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().required().max(30).min(4).label("Username"),
  email: Joi.string().email().required().label("Email Address"),
  firstName: Joi.string().max(20),
  lastName: Joi.string().max(20),
  phoneNumber: Joi.string().min(9).max(14).label("Phone Number").required(),
  password: Joi.string()
    .min(4)
    .max(12)
    .label("Password")
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirmPassword: Joi.ref("password"),
});

const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  password: Joi.string().required(),
});
exports.userValidator = async (data) => {
  return await userSchema.validateAsync(data);
};
exports.loginValidator = async (data) => {
  return await loginSchema.validateAsync(data);
};
