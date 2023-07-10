const actions = [
  "create_patient",
  "view_patient",
  "delete_patient",
  "update_patient",
];
const patientActions = {
  create: actions[0],
  read: actions[1],
  delete: actions[2],
  update: actions[3],
};
exports.surpotedPermisionAction = actions;
exports.patientActions = patientActions;
