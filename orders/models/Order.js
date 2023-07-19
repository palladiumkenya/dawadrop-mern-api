const { model, Schema } = require("mongoose");
const Address = require("./Address");
const TimeSlot = require("./TimeSlot");

module.exports = model(
  "Order",
  new Schema({
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointMent: {
      type: Number,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
    deliveryAddress: {
      type: Address.schema,
      required: true,
    },
    deliveryTimeSlot: {
      type: TimeSlot.schema,
      required: true,
    },
    deliveryMode: {
      type: Schema.Types.ObjectId,
      ref: "Mode",
    },
    phoneNumber: {
      type: String,
      maxlength: 14,
      minlength: 9,
      unique: true,
    },
    drug: {
      type: String,
      required: true,
    },
  })
);
