const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const Address = require("./Address");
const TimeSlot = require("../../deliveries/models/TimeSlot");
const DeliveryMethod = require("../../deliveries/models/DeliveryMethod");
const Mode = require("../../deliveries/models/Mode");

const Order = model(
  "Order",
  new Schema(
    {
      patient: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
      },
      appointment: {
        type: new Schema({
          id: {
            type: Number,
            required: true,
          },
          appointment_type: {
            type: String,
            required: true,
          },
          appointment_date: String,
        }),
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
      },
      deliveryMode: {
        type: Mode.schema,
      },
      deliveryMethod: {
        type: DeliveryMethod.schema,
        required: true,
      },
      phoneNumber: {
        type: String,
        maxlength: 14,
        minlength: 9,
      },
      drug: {
        type: String,
        required: true,
      },
      isDispensed: {
        type: Boolean,
        default: false,
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

module.exports = Order;
