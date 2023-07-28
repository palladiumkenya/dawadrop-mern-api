const { model, Schema } = require("mongoose");

const DeliveryMethod = model(
  "DeliveryMethod",
  new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
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
