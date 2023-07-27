const { model, Schema } = require("mongoose");

const DeliveryMethod = model(
  "DeliveryMethod",
  new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
  })
);

module.exports = DeliveryMethod;
