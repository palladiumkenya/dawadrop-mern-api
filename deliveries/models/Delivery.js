const { model, Schema } = require("mongoose");

module.exports = model(
  "Delivery",
  new Schema({
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
   
  })
);
