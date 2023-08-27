const { model, Schema } = require("mongoose");

const Mode = model(
  "Mode",
  new Schema(
    {
      name: {
        type: String,
        required: true,
        validate: {
          validator: async function (v) {
            const currMode = this; // Reference to the current user document
            // Check if another user exists with the same phone number
            const existingMode = await Mode.findOne({ name: v });
            if (existingMode && !existingMode._id.equals(currMode._id)) {
              throw new Error("Mode with name " + v + " already exists!");
            }
            return true;
          },
          message: "Mode with name {VALUE} already exist!",
        },
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

module.exports = Mode;
