const fs = require("fs");
const actions = [
  // patient actions
  "create_patient",
  "view_patient",
  "delete_patient",
  "update_patient",
  // Roles actions
  "create_role",
  "view_role",
  "delete_role",
  "update_role",
  // Previllege actions
  "create_privilege",
  "view_privilege",
  "delete_privilege",
  "update_privilege",
];
const patientActions = {
  create: actions[0],
  read: actions[1],
  delete: actions[2],
  update: actions[3],
};
const roleActions = {
  create: actions[4],
  read: actions[5],
  delete: actions[6],
  update: actions[7],
};
const privilegeActions = {
  create: actions[8],
  read: actions[9],
  delete: actions[10],
  update: actions[11],
  all: actions.filter((value, index) => index >= 8 && index <= 11),
};
const BASE_DIR = process.cwd();
const MEDIA_ROOT = `media/`;
const PROFILE_MEDIA = `uploads/`;
exports.surpotedPermisionAction = actions;
exports.patientActions = patientActions;
exports.roleActions = roleActions;
exports.privilegeActions = privilegeActions;
exports.BASE_DIR = BASE_DIR;
exports.MEDIA_ROOT = MEDIA_ROOT;
exports.PROFILE_MEDIA = PROFILE_MEDIA;
