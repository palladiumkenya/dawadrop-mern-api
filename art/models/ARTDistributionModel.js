const { model, Schema } = require("mongoose");
const { ORDER_MODELS } = require("../../utils/constants");

const ARTDistributionModel = model(
  "ARTDistributionModel",
  new Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    modelCode: {
      type: String,
      required: true,
      unique: true,
      enum: {
        values: ORDER_MODELS,
        message: `code {VALUE} not supported.Must be ${ORDER_MODELS.join(
          ", "
        )}`,
      },
    },
  })
);

module.exports = ARTDistributionModel;
