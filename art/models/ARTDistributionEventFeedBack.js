const { model, Schema } = require("mongoose");
const ARTDistributionEvent = require("./ARTDistributionEvent");
const DeliveryRequest = require("../../orders/models/DeliveryRequest");

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
      ref: "DeliveryRequest",
    },
    note: {
      type: String,
    },
  })
);

module.exports = ARTDistributionEventFeedBack;
