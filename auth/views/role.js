const { isEmpty } = require("lodash");
const { getValidationErrrJson } = require("../../utils/helpers");
const { privilegesValidator, rolesValidator } = require("../validators");
const Role = require("./../models/Role");

const rolesListing = async (req, res) => {
  const roles = await Role.find().populate(
    "privileges",
    "_id name description action"
  );
  res.json({ results: roles });
};
const roleDetail = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("privileges", [
      "name",
      "description",
    ]);
    if (!role) {
      throw new Error("Role not found");
    }
    return res.json(role);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const roleCreate = async (req, res) => {
  try {
    const value = await rolesValidator(req.body);
    let role = new Role(value);
    role = await role.save();

    return res.json(await role.populate("privileges", ["name", "description"]));
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const roleUpdate = async (req, res) => {
  try {
    const value = await rolesValidator(req.body);
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new Error("Role not found");
    }
    role.name = value.name;
    role.description = value.description;
    if (!isEmpty(value.privileges)) role.privileges = value.privileges;
    await role.save();
    return res.json(await role.populate("privileges", ["name", "description"]));
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const addRollPrivilege = async (req, res) => {
  try {
    const value = await rolesValidator(req.body);
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new Error("Role not found");
    }
    role.name = value.name;
    role.description = value.description;
    role.privileges = value.privileges;
    await role.save();
    return res.json(await role.populate("privileges", ["name", "description"]));
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  rolesListing,
  roleDetail,
  roleCreate,
  roleUpdate,
  addRollPrivilege,
};
