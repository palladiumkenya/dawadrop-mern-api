const { isEmpty } = require("lodash");
const { getValidationErrrJson } = require("../../utils/helpers");
const {
  privilegesValidator,
  rolesValidator,
  rolePrivilegeAddValidator,
  userRolesValidator,
} = require("../validators");
const Role = require("./../models/Role");
const Privilege = require("../models/Privilege");
const User = require("../models/User");
const MenuOption = require("../models/MenuOption");

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
    const role = await Role.findOne({ _id: req.params.id });
    if (!role)
      throw {
        status: 404,
        message: "Role not found!",
      };
    const { privileges } = await rolePrivilegeAddValidator(req.body);
    for (const privilege of privileges) {
      if (await Privilege.findOne({ _id: privilege })) {
        await role.addPrivilege(privilege, false);
      }
    }
    await role.save();
    return res.json(
      await role.populate("privileges", ["name", "description", "action"])
    );
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const deleteRollPrivilege = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id });
    if (!role)
      throw {
        status: 404,
        message: "Role not found!",
      };
    const { privileges } = await rolePrivilegeAddValidator(req.body);
    for (const privilege of privileges) {
      if (await Privilege.findOne({ _id: privilege })) {
        await role.deletePrivilege(privilege, false);
      }
    }
    await role.save();
    return res.json(
      await role.populate("privileges", ["name", "description", "action"])
    );
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const assignUserRoles = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user)
      throw {
        status: 404,
        message: "User not found!",
      };
    const { roles } = await userRolesValidator(req.body);
    for (const role of roles) {
      if (await Role.findOne({ _id: role })) {
        await user.addRole(role, false);
      }
    }
    await user.save();
    return res.json(
      await user.populate("roles", ["_id", "name", "description", "privileges"])
    );
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const deleteUserRoles = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user)
      throw {
        status: 404,
        message: "User not found!",
      };
    const { roles } = await rolePrivilegeAddValidator(req.body);
    for (const role of roles) {
      if (await Role.findOne({ _id: role })) {
        await user.deleteRole(role, false);
      }
    }
    await user.save();
    return res.json(
      await user.populate("roles", ["_id", "name", "description", "privileges"])
    );
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const menuOptionsList = async (req, res) => {
  const options = await MenuOption.find();
  res.json({ results: options });
};
const menuOptionCreate = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);
    res.json({ res: req.body });
  } catch (error) {
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
  deleteRollPrivilege,
  assignUserRoles,
  deleteUserRoles,
  menuOptionsList,
  menuOptionCreate,
};
