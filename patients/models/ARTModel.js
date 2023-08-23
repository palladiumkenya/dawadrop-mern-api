const { model, Schema } = require("mongoose");

const ARTModel = model(
  "ARTModel",
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
        values: ["first_line", "community_art"],
        message:
          "code {VALUE} not supported.Must be first_line or community_art",
      },
    },
  })
);

module.exports = ARTModel;
