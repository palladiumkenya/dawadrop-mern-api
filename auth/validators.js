const Joi = require("joi");
const { surpotedPermisionAction } = require("../utils/constants");

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

const changePaswordSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).label("Username"),
  currentPassword: Joi.string().required().label("Current Password"),
  newPassword: Joi.string().required().label("New Password"),
  confirmNewPassword: Joi.ref("newPassword"),
});

const privilegeSchema = Joi.object({
  name: Joi.string().required().min(4).max(30).label("Name"),
  action: Joi.string().required(),
  description: Joi.string().min(4).label("Description"),
});
const roleSchema = Joi.object({
  name: Joi.string().required().min(4).max(30).label("Name"),
  description: Joi.string().min(4).label("Description"),
  privileges: Joi.array().label("Privilege").default([]),
});

const rolePrivilegeAddSchema = Joi.object({
  privileges: Joi.array().required().min(1),
});
exports.userValidator = async (data) => {
  return await userSchema.validateAsync(data);
};
exports.loginValidator = async (data) => {
  return await loginSchema.validateAsync(data);
};
exports.changePaswordValidator = async (data) => {
  return await changePaswordSchema.validateAsync(data);
};
exports.privilegesValidator = async (data) => {
  return await privilegeSchema.validateAsync(data);
};
exports.rolesValidator = async (data) => {
  return await roleSchema.validateAsync(data);
};
exports.rolePrivilegeAddValidator = async (data) => {
  return await rolePrivilegeAddSchema.validateAsync(data);
};
