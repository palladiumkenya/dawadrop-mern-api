const { model, Schema } = require("mongoose");

const Address = model(
  "Address",
  new Schema({
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    address: {
      type: String,
      maxlength: 255,
    },
  })
);

module.exports = Address;
