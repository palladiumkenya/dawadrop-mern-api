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
      validate: {
        validator: async function (v) {
          const currGroup = this; // Reference to the current user document
          // Check if another user exists with the same phone number
          const existingGroup = await ARTDistributionGroup.findOne({
            title: v,
          });
          if (existingGroup && !existingGroup._id.equals(currGroup._id)) {
            throw new Error("Group with name " + v + " already exists!");
          }
          return true;
        },
        message: "Group with name {VALUE} already exist!",
      },
    },
    extraSubscribers: {
      type: [
        new Schema({
          name: {
            type: String,
            require: true,
          },
          cccNumber: {
            type: String,
            require: true,
          },
          phoneNumber: {
            type: String,
            required: true,
          },
        }),
      ],
      default: [],
    },
    description: {
      type: String,
    },
  })
);

module.exports = ARTDistributionGroup;
