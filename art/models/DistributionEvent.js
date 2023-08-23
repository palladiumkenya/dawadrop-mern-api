const { model, Schema } = require("mongoose");
const Address = require("../../orders/models/Address");
const ARTCommunityLead = require("./ARTCommunityLead");

const DistributionEvent = model(
  "DistributionEvent",
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
    lead: {
      type: ARTCommunityLead.schema,
      required: true,
    },
    remarks: {
      type: String,
    },
  })
);

module.exports = DistributionEvent;
