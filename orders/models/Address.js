const { model, Schema } = require("mongoose");

const Address = model(
  "Address",
  new Schema({
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    address: {
      type: String,
      maxlength: 255,
    },
  })
);

module.exports = Address;
