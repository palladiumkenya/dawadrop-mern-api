const { model, Schema } = require("mongoose");

const CourrierService = model(
  "CourrierService",
  new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
  })
);

module.exports = CourrierService;
