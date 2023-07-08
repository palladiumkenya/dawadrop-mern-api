const { model, Schema } = require("mongoose");

module.exports = model(
  "Privilege",
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
  })
);
