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
          validator: async function (v) {
            const currentUser = this; // Reference to the current user document

            // Check if another user exists with the same username
            const existingUser = await User.findOne({ username: v });

            // If an existing user is found and it is not the current user, throw an error
            if (existingUser && !existingUser._id.equals(currentUser._id)) {
              throw new Error("User with username " + v + " already exists!");
            }

            return true;
          },
          message: "User with username {VALUE} already exists!",
        },
      },

      email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: async function (v) {
            const currentUser = this; // Reference to the current user document
            // Check if another user exists with the same email
            const existingUser = await User.findOne({ email: v });
            // If an existing user is found and it is not the current user, throw an error
            if (existingUser && !existingUser._id.equals(currentUser._id)) {
              throw new Error("User with email " + v + " already exists!");
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
          validator: async function (v) {
            const currentUser = this; // Reference to the current user document
            // Check if another user exists with the same phone number
            const existingUser = await User.findOne({ phoneNumber: v });
            if (existingUser && !existingUser._id.equals(currentUser._id)) {
              throw new Error(
                "User with phone number " + v + " already exists!"
              );
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
        async getMenuOptionsIds() {
          const options = [];
          const roles = await Role.find({ _id: { $in: this.roles } });
          roles.forEach((role) => {
            role.menuOptions.forEach((menu) => {
              if (!options.includes(menu)) {
                options.push(menu);
              }
            });
          });
          return options;
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
