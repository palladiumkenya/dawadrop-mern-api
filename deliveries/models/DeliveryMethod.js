const { model, Schema } = require("mongoose");

const DeliveryMethod = model(
  "DeliveryMethod",
  new Schema(
    {
      name: {
        type: String,
        required: true,
        validate: {
          validator: async function (v) {
            const currMethod = this; // Reference to the current user document
            // Check if another user exists with the same phone number
            const existingMethod = await DeliveryMethod.findOne({ name: v });
            if (existingMethod && !existingMethod._id.equals(currMethod._id)) {
              throw new Error(
                "Delivery method with name " + v + " already exists!"
              );
            }
            return true;
          },
          message: "Delivery method with name {VALUE} already exist!",
        },
      },
      description: {
        type: String,
      },
      blockOnTimeSlotFull: {
        type: Boolean,
        default: true,
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

module.exports = DeliveryMethod;
