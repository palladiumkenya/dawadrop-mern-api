const { model, Schema } = require("mongoose");

const SmsConfig = model(
  "SmsConfig",
  new Schema({
    smsTemplate: {
      type: String,
      required: true,
    },
    smsType: {
      type: String,
      require: true,
      unique: true,
      enum: { values: ["EVENT_REMINDER"], message: "Invalid sms type" },
    },
  })
);

module.exports = SmsConfig;
