const moment = require("moment/moment");
const { model, Schema } = require("mongoose");
const { generateOTP, generateExpiryTime } = require("../../utils/helpers");


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
      virtuals: {
        created: {
          get: function () {
            const timestamp = this._id.getTimestamp();
            return timestamp;
          },
        },
      },
      // Options for virtual properties
      toJSON: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to JSON
      toObject: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to object
    }
  )
);

module.exports = AccountVerification;
