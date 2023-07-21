const { model, Schema } = require("mongoose");

module.exports = model(
  "Address",
  new Schema({
    latitude: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    longitude: {
      type: Schema.Types.Decimal128,
      required: true
    },
    address: {
      type: String,
      maxlength: 255,
    },
    
  })
);
