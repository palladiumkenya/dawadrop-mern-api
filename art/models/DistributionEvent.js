const { model, Schema } = require("mongoose");
const ARTModel = require("./ARTModel");
const Address = require("../../orders/models/Address");

const DistributionEvent = model(
  "DistributionEvent",
  new Schema({
    artModel: {
      type: ARTModel.schema,
      required: true,
    },
    distributionTime: {
      type: String,
      required: true,
    },
    distributionDate: {
      type: Date,
      required: true,
    },
    distributionLocation: {
      type: Address.schema,
      required: true,
    },
    lead,
  })
);

module.exports = DistributionEvent;
