const { model, Schema } = require("mongoose");

module.exports = model(
  "DeliveryFeedBack",
  new Schema(
    {
      review: {
        type: String,
        maxlength: 255,
        required: true,
      },
      rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
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
