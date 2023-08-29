const { model, Schema, Types } = require("mongoose");

const ARTDistributionGroupLead = model(
  "ARTDistributionGroupLead",
  new Schema({
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    artModel: {
      type: Types.ObjectId,
      ref: "ARTDistributionModel",
      required: true,
    },
    registeredBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

module.exports = ARTDistributionGroupLead;
