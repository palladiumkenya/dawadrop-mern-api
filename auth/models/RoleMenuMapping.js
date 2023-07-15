const { model, Schema } = require("mongoose");
const MenuOption = require("./MenuOption");

const RoleMenuMapping = model(
  "RoleMenuMapping",
  new Schema({
    role: {
      type: Schema.Types.ObjectId,
      unique: true,
      ref: "Role",
    },
    menuOptions: [MenuOption.schema],
  })
);

module.exports = RoleMenuMapping;
