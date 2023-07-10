const { model, Schema } = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const Role = require("./Role");

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
      lastLogin: {
        type: Date,
        default: Date.now,
      },
      roles: {
        type: [Schema.Types.ObjectId],
        ref: "Role",
        default: [],
      },
      isSuperUser: {
        type: Boolean,
        default: false,
      },
    },
    {
      methods: {
        generateAuthToken() {
          return jwt.sign({ _id: this._id }, config.get("jwt"));
        },
        async getPrivilegeIds() {
          const privileges = [];
          const roles = await Role.find({ _id: { $in: this.roles } });
          roles.forEach((role) => {
            role.privileges.forEach((privilege) => {
              if (!privileges.includes(privilege)) {
                privileges.push(privilege);
              }
            });
          });
          return privileges;
        },
        async hasPrivilege(privilegeId) {
          return (
            (await this.getPrivilegeIds()).findIndex((priv) =>
              priv.equals(privilegeId)
            ) !== -1
          );
        },
      },
    }
  )
);

module.exports = User;
