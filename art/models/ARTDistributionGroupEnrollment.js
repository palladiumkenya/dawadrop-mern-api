const { model, Schema, Types } = require("mongoose");
const ARTDistributionGroup = require("./ARTDistributionGroup");

const ARTDistributionGroupEnrollment = model(
  "ARTDistributionGroupEnrollment",
  new Schema({
    group: {
      type: ARTDistributionGroup.schema,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  })
);

module.exports = ARTDistributionGroupEnrollment;
