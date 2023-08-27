const { isEmpty, merge } = require("lodash");
const {
  getValidationErrrJson,
  deleteUploadedFileAsyncMannual,
  getUpdateFileAsync,
  constructFilter,
} = require("../../utils/helpers");
const {
  privilegesValidator,
  rolesValidator,
  rolePrivilegeAddValidator,
  userRolesValidator,
  menuOptionValidator,
  roleMenuOptionsAddValidator,
} = require("../validators");
const Role = require("./../models/Role");
const Privilege = require("../models/Privilege");
const User = require("../models/User");
const MenuOption = require("../models/MenuOption");
const { MENU_MEDIA, MEDIA_ROOT } = require("../../utils/constants");

const rolesListing = async (req, res) => {
  const roles = await Role.find()
    .populate("privileges", "_id name description action")
    .populate("menuOptions");
  const _roles = await Role.aggregate([
    constructFilter(req.query, [
      "name",
      "description",
      "privileges",
      "menuOptions",
    ]),
    {
      $lookup: {
        from: "privileges",
        foreignField: "_id",
        localField: "privileges",
        as: "privileges",
      },
    },
    {
      $lookup: {
        from: "menuoptions",
        foreignField: "_id",
        localField: "menuOptions",
        as: "menuOptions",
      },
    },
    {
      $project: {
        __v: 0,
        menuOptions: {
          __v: 0,
        },
        privileges: {
          __v: 0,
        },
      },
    },
  ]);
  res.json({ results: _roles });
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
    role.assignAllPatients = value.assignAllPatients;
    role.assignPickupCareGivers = value.assignPickupCareGivers;
    role.assignGroupLeads = value.assignGroupLeads;
    if (!isEmpty(value.privileges)) role.privileges = value.privileges;
    if (!isEmpty(value.menuOptions)) role.menuOptions = value.menuOptions;
    await role.save();
    return res.json(role);
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
const addRollMenuOptions = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id });
    if (!role)
      throw {
        status: 404,
        message: "Role not found!",
      };
    const { menuOptions } = await roleMenuOptionsAddValidator(req.body);
    for (const menu of menuOptions) {
      if (await MenuOption.findOne({ _id: menu })) {
        await role.addMenuOption(menu, false);
      }
    }
    await role.save();
    return res.json(await role.populate("menuOptions"));
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const deleteRollMenuOption = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id });
    if (!role)
      throw {
        status: 404,
        message: "Role not found!",
      };
    const { menuOptions } = await roleMenuOptionsAddValidator(req.body);
    for (const menu of menuOptions) {
      if (await MenuOption.findOne({ _id: menu })) {
        await role.deleteMenuOption(menu, false);
      }
    }
    await role.save();
    return res.json(await role.populate("menuOptions"));
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
    user.roles = roles;
    await user.save();
    return res.json(
      await user.populate("roles", [
        "_id",
        "name",
        "description",
        "privileges",
        "menuOptions",
      ])
    );
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const addUserRoles = async (req, res) => {
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
      await user.populate("roles", [
        "_id",
        "name",
        "description",
        "privileges",
        "menuOptions",
      ])
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
    const { roles } = await userRolesValidator(req.body);
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
    const value = await menuOptionValidator({
      ...req.body,
      image: req.file ? `/${MENU_MEDIA}${req.file.filename}` : undefined,
    });
    const menuOption = new MenuOption(value);
    await menuOption.save();
    res.json(menuOption);
  } catch (ex) {
    if (req.file) await deleteUploadedFileAsyncMannual(req.file.path);
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const menuOptionDetail = async (req, res) => {
  try {
    const menuOption = await MenuOption.findById(req.params.id);
    if (!menuOption) {
      throw {
        status: 404,
        message: "Menu Option not found",
      };
    }
    res.json(menuOption);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const menuOptionUpdate = async (req, res) => {
  try {
    let menuOption = await MenuOption.findById(req.params.id);
    if (!menuOption)
      throw {
        status: 404,
        message: "Menu Option not found",
      };
    const value = await menuOptionValidator({
      ...req.body,
      image: await getUpdateFileAsync(req, MENU_MEDIA, menuOption.image),
    });
    menuOption = merge(menuOption, value);
    await menuOption.save();
    res.json(menuOption);
  } catch (ex) {
    if (req.file) await deleteUploadedFileAsyncMannual(req.file.path);
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const userMenuOptionsList = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const menuOptions = await user.getMenuOptionsIds();
  res.json({ results: await MenuOption.find({ _id: { $in: menuOptions } }) });
};

const userAuthInfo = async (req, res) => {
  const user = await User.findById(req.params.id);
  return res.json({
    roles: await Role.find({ _id: { $in: await user.getAllRoleIds() } }),
    menuOptions: await MenuOption.find({
      _id: { $in: await user.getMenuOptionsIds() },
    }),
    privileges: await Privilege.find({
      _id: { $in: await user.getPrivilegeIds() },
    }),
  });
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
  menuOptionUpdate,
  menuOptionDetail,
  addRollMenuOptions,
  deleteRollMenuOption,
  userMenuOptionsList,
  addUserRoles,
  userAuthInfo,
};
