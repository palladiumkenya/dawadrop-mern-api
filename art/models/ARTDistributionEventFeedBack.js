const { model, Schema } = require("mongoose");
const ARTDistributionEvent = require("./ARTDistributionEvent");
const DeliveryServiceRequest = require("../../orders/models/DeliveryServiceRequest");

const ARTDistributionEventFeedBack = model(
  "ARTDistributionEventFeedBack",
  new Schema({
    event: {
      type: Schema.Types.ObjectId,
      ref: "ARTDistributionEvent",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    confirmedAttendance: {
      type: Schema.Types.Boolean,
      default: false,
    },
    deliveryRequest: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryServiceRequest",
    },
    note: {
      type: String,
    },
  })
);

module.exports = ARTDistributionEventFeedBack;
