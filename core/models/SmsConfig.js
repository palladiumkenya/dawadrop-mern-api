const { model, Schema } = require("mongoose");

const SmsConfig = model(
  "SmsConfig",
  new Schema({
    name: { type: String, required: true },
    description: { type: String },
    smsTemplate: {
      type: String,
      required: true,
    },
    smsType: {
      type: String,
      require: true,
      unique: true,
      enum: { values: ["EVENT_REMINDER", "DELIVERY_INITIATION", "ORDER_SUCCESS", "DELIVERY_SUCCESS"], message: "Invalid sms type" },
      validate: {
        validator: async function (v) {
          const currConfig = this; // Reference to the current user document

          // Check if another user exists with the same username
          const existingConfig = await SmsConfig.findOne({ smsType: v });

          // If an existing user is found and it is not the current user, throw an error
          if (existingConfig && !existingConfig._id.equals(currConfig._id)) {
            throw new Error(
              "Configuration with sms type " + v + " already exists!"
            );
          }

          return true;
        },
        message: "Configuration with sms type {VALUE} already exists!",
      },
    },
  })
);

module.exports = SmsConfig;
