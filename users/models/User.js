const { model, Schema } = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");

const User = model(
  "User",
  new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: [true, "User with that username already exist!"],
        maxlength: 30,
        minlength: 4,
      },
      email: {
        type: String,
        required: true,
        unique: [true, "User with that email already exist!"],
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
    },
    {
      methods: {
        generateAuthToken() {
          return jwt.sign({ _id: this._id }, config.get("jwt"));
        },
      },
    }
  )
);

module.exports = User;
