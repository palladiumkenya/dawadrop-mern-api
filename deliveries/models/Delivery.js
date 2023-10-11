const { model, Schema, Types } = require("mongoose");
const Address = require("../../orders/models/Address");
const User = require("../../auth/models/User");
const DeliveryServiceRequest = require("../../orders/models/DeliveryServiceRequest");
const Patient = require("../../patients/models/Patient");
const CourrierService = require("./CourrierService");
const { generateOTP } = require("../../utils/helpers");

const Delivery = model(
  "Delivery",
  new Schema(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryServiceRequest",
        validate: {
          message: "DeliveryServiceRequest don't exist",
          validator: async function (v) {
            // Check if valid order
            if (v && !(await DeliveryServiceRequest.findById(v)))
              throw new Error("DeliveryServiceRequest doesn't Exist");
          },
        },
      },
      patient: {
        //subscriber
        type: Schema.Types.ObjectId,
        ref: "Patient",
      },
      services: {
        type: [String],
        default: [],
      },
      deliveryType: {
        type: String,
        required: true,
        enum: ["self", "courrier", "patient-preferred"],
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
      deliveryAddress: {
        type: Address.schema,
      },
      event: {
        type: Types.ObjectId,
        ref: "ARTDistributionEvent",
      },
      initiatedBy: {
        type: Types.ObjectId,
        ref: "User"
      }
    },
    {
      timestamps: true, // Automatically add createdAt and updatedAt fields
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
          const order = await DeliveryServiceRequest.findById(this.order._id);
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
