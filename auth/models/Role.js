const { model, Schema } = require("mongoose");

const Role = model(
  "Role",
  new Schema({
    name: {
      type: String,
      maxlength: 30,
      minlength: 4,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      maxlength: 1024,
      minlength: 4,
    },
    privileges: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "Privilege",
    },
  })
);

module.exports = Role;
