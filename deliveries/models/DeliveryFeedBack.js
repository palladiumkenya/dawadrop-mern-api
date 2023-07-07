const { model, Schema } = require("mongoose");

module.exports = model(
  "DeliveryFeedBack",
  new Schema({
    review: {
      type: String,
      maxlength: 255,
      required: true,
    },
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
  })
);
