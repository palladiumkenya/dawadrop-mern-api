const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const Address = require("./Address");
const TimeSlot = require("../../deliveries/models/TimeSlot");
const DeliveryMethod = require("../../deliveries/models/DeliveryMethod");
const Mode = require("../../deliveries/models/Mode");
const CourrierService = require("../../deliveries/models/CourrierService");

const DeliveryRequest = model(
  "DeliveryRequest",
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
          next_appointment_date: {
            type: Date,
            required: true,
          },
        }),
      },
      event: {
        type: Schema.Types.ObjectId,
        ref: "ARTDistributionEvent",
      },
      updated: {
        type: Date,
        default: Date.now,
      },
      deliveryAddress: {
        type: Address.schema,
        required: true,
      },
      deliveryMethod: {
        type: DeliveryMethod.schema,
        required: true,
      },
      courrierService: {
        type: CourrierService.schema,
      },
      deliveryPerson: {
        type: new Schema({
          fullName: {
            type: String,
            required: true,
          },
          nationalId: {
            type: Schema.Types.Number,
            required: true,
          },
          phoneNumber: {
            type: Schema.Types.String,
            required: true,
          },
          pickUpTime: {
            type: Schema.Types.Date,
            required: true,
          },
        }),
      },
      phoneNumber: {
        type: String,
        maxlength: 14,
        minlength: 9,
      },
      orderedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
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

module.exports = DeliveryRequest;
