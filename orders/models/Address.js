const { model, Schema } = require("mongoose");

const Address = model(
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

module.exports = Address;
