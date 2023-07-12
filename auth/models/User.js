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
        unique: true,
        maxlength: 30,
        minlength: 4,
        validate: {
          validator: async (v) => {
            const existingUser = await User.findOne({ username: v });
            if (existingUser) {
              throw new Error("User with username " + v + " already exist!");
            }
            return true;
          },
          message: "User with username {VALUE} already exist!",
        },
      },
      email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: async (v) => {
            const existingUser = await User.findOne({ email: v });
            if (existingUser) {
              throw new Error("User with email " + v + " already exist!");
            }
            return true;
          },
          message: "User with email {VALUE} already exist!",
        },
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
        validate: {
          validator: async (v) => {
            const existingUser = await User.findOne({ phoneNumber: v });
            if (existingUser) {
              throw new Error("User with phon number " + v + " already exist!");
            }
            return true;
          },
          message: "User with phone number {VALUE} already exist!",
        },
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
        hasRole(roleId) {
          return this.roles.findIndex((role) => role.equals(roleId)) !== -1;
        },
        async addRole(roleId, commit = true) {
          if (!this.hasRole(roleId)) {
            this.roles.push(roleId);
            if (commit) await this.save();
          }
        },
        async deleteRole(roleId, commit = true) {
          if (this.hasRole(roleId)) {
            this.roles = this.roles.filter((role) => !role.equals(roleId));
            if (commit) await this.save();
          }
        },
      },
      statics: {
        async isExisting(filterQuery) {
          const users = await this.find(query);
          return users.length > 0;
        },
      },
    }
  )
);

module.exports = User;
