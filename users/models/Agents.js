const { model, Schema } = require("mongoose");
module.exports = model(
  "Agent",
  new Schema({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User"
    },
    primaryFacility: {
      type: Number,
      required: true,

    },
  })
);
