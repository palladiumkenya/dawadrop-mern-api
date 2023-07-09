const moment = require("moment/moment");
const { model, Schema } = require("mongoose");

function generateOTP(length = 5) {
  var string = "0123456789";
  let OTP = "";
  var len = string.length;
  for (let i = 0; i < length; i++) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}
function generateExpiryTime(minutes = 5) {
  return moment().add(minutes, "minute");
}
const AccountVerification = model(
  "AccountVerification",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      otp: {
        type: String,
        default: () => generateOTP(5),
      },
      expiry: {
        type: Date,
        default: () => generateExpiryTime(5),
      },
      verified: {
        type: Boolean,
        default: false,
      },
      extra: {
        type: String,
        maxlength: 255,
      },
    },
    {
      statics: {
        async getOrCreate({ user, extra }) {
          let verification = await this.findOne({
            user,
            verified: false,
            expiry: {
              $gte: moment(),
            },
          });
          if (!verification) {
            verification = new this({ user, extra });
            await verification.save();
          }
          return verification;
        },
      },
    }
  )
);

module.exports = AccountVerification;
