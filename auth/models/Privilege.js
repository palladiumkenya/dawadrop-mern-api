const { model, Schema } = require("mongoose");
const { surpotedPermisionAction } = require("../../utils/constants");

const Privilege = model(
  "Privilege",
  new Schema({
    name: {
      type: String,
      maxlength: 30,
      minlength: 4,
      required: true,
      unique: true,
    },
    action: {
      type: String,
      required: true,
      unique: true,
      enum: {
        values: surpotedPermisionAction,
        message: `{VALUE} not supported.Must be in surpoted actions: [${surpotedPermisionAction.join(
          ", "
        )}]`,
      },
    },
    description: {
      type: String,
      maxlength: 1024,
      minlength: 4,
    },
  })
);

module.exports = Privilege;
