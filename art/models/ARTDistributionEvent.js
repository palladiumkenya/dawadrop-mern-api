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
      type: String,
      required: true,
    },
    distributionLocation: {
      type: Address.schema,
      required: true,
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
