const { model, Schema } = require("mongoose");
const ARTDistributionGroupLead = require("./ARTDistributionGroupLead");

const ARTDistributionGroup = model(
  "ARTDistributionGroup",
  new Schema({
    lead: {
      type: ARTDistributionGroupLead.schema,
      required: true,
    },
    title: {
      type: String,
      require: true,
      unique: true,
    },
    description: {
      type: String,
    },
  })
);

module.exports = ARTDistributionGroup;
