const { model, Schema, Types } = require("mongoose");
const Address = require("../../orders/models/Address");
const User = require("../../auth/models/User");
const DeliveryRequest = require("../../orders/models/DeliveryRequest");
const Patient = require("../../patients/models/Patient");

const Delivery = model(
  "Delivery",
  new Schema(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryRequest",
        required: true,
        validate: {
          message: "DeliveryRequest don't exist",
          validator: async function (v) {
            // Check if valid order
            if (v && !(await DeliveryRequest.findById(v)))
              throw new Error("DeliveryRequest doesn't Exist");
          },
        },
      },
      dispencedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        validate: {
          message: "Dispensor don't exist",
          validator: async function (v) {
            if (v && !(await User.findById(v)))
              throw new Error("Dispensor doesn't Exist");
          },
        },
      },
      deliveredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
          message: "Delivery agent don't exist",
          validator: async function (v) {
            if (v && !(await User.findById(v)))
              throw new Error("Delivery agent doesn't Exist");
          },
        },
      },
      location: {
        type: Address.schema,
        required: true,
      },
      status: {
        type: String,
        enum: {
          values: ["canceled", "delivered", "pending"],
          message: "Status mus be either canceled, delivered and pending",
        },
      },
      streamUrl: {
        type: String,
        required: true,
        match: /(https?:\/\/[^\s]+)/g,
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
      methods: {
        getRecepientUser: async function () {
          const order = await DeliveryRequest.findById(this.order._id);
          const patient = await Patient.findOne({ _id: order.patient._id });
          const user = await User.findOne({ _id: patient.user._id });
          return user;
        },
        isRecepientUser: async function (userId) {
          const user = await this.getRecepientUser();
          return user._id.equals(userId);
        },
      },
      // Options for virtual properties
      toJSON: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to JSON
      toObject: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to object
    }
  )
);

module.exports = Delivery;
