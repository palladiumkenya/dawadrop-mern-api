const { getValidationErrrJson } = require("../../utils/helpers");
const Privilege = require("./../models/Privilege");
const {
  userValidator,
  loginValidator,
  privilegesValidator,
} = require("./../validators");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const privilegeList = async (req, res) => {
  const privileges = await Privilege.find();
  res.json({ results: privileges });
};

const privilegeCreate = async (req, res) => {
  try {
    const value = await privilegesValidator(req.body);
    const privilege = new Privilege(value);
    await privilege.save();
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const privilegeUpdate = async (req, res) => {
  try {
    const value = await privilegesValidator(req.body);
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      throw new Error("Privilege not found");
    }
    privilege.name = value.name;
    privilege.description = value.description;
    await privilege.save();
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const privilegeDetail = async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      throw new Error("Privilege not found");
    }
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
module.exports = {
  privilegeList,
  privilegeCreate,
  privilegeUpdate,
  privilegeDetail,
};
