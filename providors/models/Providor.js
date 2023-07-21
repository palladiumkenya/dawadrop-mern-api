const { model, Schema } = require("mongoose");
module.exports = model(
  "Agent",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: "User",
      },
      primaryFacility: {
        type: Number,
        required: true,
      },
    },
    {
      virtuals: {
        created: {
          get: function () {
            const timestamp = this._id.getTimestamp();
            return timestamp;
          },
        },
      },
      // Options for virtual properties
      toJSON: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to JSON
      toObject: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to object
    }
  )
);
