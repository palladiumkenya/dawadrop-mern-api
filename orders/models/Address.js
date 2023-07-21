const { model, Schema } = require("mongoose");

module.exports = model(
  "Address",
  new Schema({
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      maxlength: 255,
    },
  })
);
