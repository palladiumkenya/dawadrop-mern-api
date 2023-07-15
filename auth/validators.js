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
const profileSchema = Joi.object({
  username: Joi.string().required().max(30).min(4).label("Username"),
  email: Joi.string().email().required().label("Email Address"),
  firstName: Joi.string().max(20).label("First Name"),
  lastName: Joi.string().max(20).label("Last Name"),
  phoneNumber: Joi.string().min(9).max(14).label("Phone Number").required(),
  image: Joi.string().label("Image"),
});

const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  password: Joi.string().required(),
});

const changePaswordSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).label("Username"),
  currentPassword: Joi.string().required().label("Current Password"),
  newPassword: Joi.string().required().label("New Password").min(4),
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
const userRolesSchema = Joi.object({
  roles: Joi.array().required().min(1),
});

const menuOptionSchema = Joi.object({
  label: Joi.string().required().min(4).label("Label"),
  image: Joi.string().required().label("Menu Image"),
  link: Joi.string().required().label("Menu Image"),
});
exports.userValidator = async (data) => {
  return await userSchema.validateAsync(data, { abortEarly: false });
};
exports.loginValidator = async (data) => {
  return await loginSchema.validateAsync(data, { abortEarly: false });
};
exports.changePaswordValidator = async (data) => {
  return await changePaswordSchema.validateAsync(data, { abortEarly: false });
};
exports.privilegesValidator = async (data) => {
  return await privilegeSchema.validateAsync(data, { abortEarly: false });
};
exports.rolesValidator = async (data) => {
  return await roleSchema.validateAsync(data, { abortEarly: false });
};
exports.rolePrivilegeAddValidator = async (data) => {
  return await rolePrivilegeAddSchema.validateAsync(data, {
    abortEarly: false,
  });
};
exports.userRolesValidator = async (data) => {
  return await userRolesSchema.validateAsync(data, { abortEarly: false });
};
exports.profileValidator = async (data) => {
  return await profileSchema.validateAsync(data, { abortEarly: false });
};
exports.menuOptionValidator = async (data) => {
  return await menuOptionSchema.validateAsync(data, { abortEarly: false });
};
