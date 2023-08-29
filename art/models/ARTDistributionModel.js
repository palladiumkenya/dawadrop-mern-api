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
      validate: {
        validator: async function (v) {
          const currModel = this; // Reference to the current user document
          // Check if another user exists with the same phone number
          const existingModel = await ARTDistributionModel.findOne({
            modelCode: v,
          });
          if (existingModel && !existingModel._id.equals(currModel._id)) {
            throw new Error("Model with name " + v + " already exists!");
          }
          return true;
        },
        message: "Model with name {VALUE} already exist!",
      },
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
