const { model, Schema } = require("mongoose");

module.exports = model(
  "Delivery",
  new Schema(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
      },
      code: {
        type: String,
        unique: true,
      },
      dispencedBy: {
        type: Schema.Types.ObjectId,
        ref: "Agent",
      },
      status: {
        type: String,
        enum: ["cancelled", "delivered", "allocated", "on_transit", "pending"],
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
