const { model, Schema } = require("mongoose");

const CourrierService = model(
  "CourrierService",
  new Schema({
    name: {
      type: String,
      required: true,
      // uniqueness test
      validate: {
        validator: async function (v) {
          const currService = this; // Reference to the current user document
          // Check if another user exists with the same phone number
          const existingService = await CourrierService.findOne({ name: v });
          if (existingService && !existingService._id.equals(currService._id)) {
            throw new Error(
              "Courrier service with name " + v + " already exists!"
            );
          }
          return true;
        },
        message: "Courrier service with name {VALUE} already exist!",
      },
    },
  })
);

module.exports = CourrierService;
