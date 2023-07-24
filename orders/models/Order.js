const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const Address = require("./Address");
const TimeSlot = require("../../deliveries/models/TimeSlot");

module.exports = model(
  "Order",
  new Schema(
    {
      patient: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      appointment: {
        type: Number,
        required: true,
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
        // required: true,
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
