const { model, Schema, Types } = require("mongoose");

const ARTCommunityLead = model(
  "ARTCommunityLead",
  new Schema({
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    artModel: {
      type: Types.ObjectId,
      ref: "ARTModel",
      required: true,
    },
    registeredBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

module.exports = ARTCommunityLead;
