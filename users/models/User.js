const { model, Schema } = require("mongoose");
module.exports = model(
  "User",
  new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
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
    phoneNumber: {
      type: String,
      maxlength: 14,
      minlength: 9,
      unique: true,
    },
    password: {
      type: String,
      maxlength: 1024,
      required: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperUser: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  })
);
