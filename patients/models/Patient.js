const { model, Schema } = require("mongoose");
module.exports = model(
  "Patient",
  new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cccNumber: {
      type: String,
      required: true,
      unique: true,
    },
    nationalId: {
      type: Number,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      maxlength: 20,
    },
    lastName: {
      type: String,
      maxlength: 20,
    },
    surName: {
      type: String,
      maxlength: 20,
    },
    gender: {
      type: String,
      enum: ["F", "M", "U"],
    },
    phoneNumber: {
      type: String,
      maxlength: 14,
      minlength: 9,
      unique: true,
    },
    primaryClinic: {
      type: Number,
    },
  })
);
