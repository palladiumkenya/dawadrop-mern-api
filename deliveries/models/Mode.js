const { model, Schema } = require("mongoose");

module.exports = model(
  "Mode",
  new Schema({
    name: {
      type: String,
      required: true,
    },
  })
);
