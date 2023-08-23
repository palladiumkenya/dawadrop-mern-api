const { model, Schema } = require("mongoose");
const ARTDistributionGroupLead = require("./ARTDistributionGroupLead");

const ARTDistributionGroup = model(
  "ARTDistributionGroup",
  new Schema({
    lead: {
      type: ARTDistributionGroupLead.schema,
      required: true,
    },
  })
);

module.exports = ARTDistributionGroup;
