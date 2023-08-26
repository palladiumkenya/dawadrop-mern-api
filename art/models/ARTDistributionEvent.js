const { model, Schema } = require("mongoose");
const Address = require("../../orders/models/Address");
const ARTDistributionGroup = require("./ARTDistributionGroup");

const ARTDistributionEvent = model(
  "ARTDistributionEvent",
  new Schema({
    title: {
      type: String,
      required: true,
    },
    distributionTime: {
      type: Schema.Types.Date,
      required: true,
    },
    distributionLocation: {
      type: Address.schema,
      required: true,
    },
    remiderNortificationDates: {
      type: [Schema.Types.Date],
      default: [],
    },
    group: {
      type: ARTDistributionGroup.schema,
      required: true,
    },
    remarks: {
      type: String,
    },
  })
);

module.exports = ARTDistributionEvent;
