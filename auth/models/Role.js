const { model, Schema } = require("mongoose");

const Role = model(
  "Role",
  new Schema(
    {
      name: {
        type: String,
        maxlength: 30,
        minlength: 4,
        required: true,
        unique: true,
      },
      description: {
        type: String,
        maxlength: 1024,
        minlength: 4,
      },
      privileges: {
        type: [Schema.Types.ObjectId],
        default: [],
        ref: "Privilege",
      },
      menuOptions: {
        type: [Schema.Types.ObjectId],
        default: [],
        ref: "MenuOption",
      },
      assignAllPatients: {
        type: Boolean,
        default: false,
      },
      assignAllProvidors: {
        type: Boolean,
        default: false,
      },
      assignPickupCareGivers: {
        type: Boolean,
        default: false,
      },
      assignGroupLeads: {
        type: Boolean,
        default: false,
      },
      assignGroupMembers: {
        //patients in grouped model
        type: Boolean,
        default: false,
      },
      assignAllUsers: {
        type: Boolean,
        default: false,
      },
    },
    {
      methods: {
        hasPrivilege(privilegeId) {
          return (
            this.privileges.findIndex((priv) => priv.equals(privilegeId)) !== -1
          );
        },
        hasMenuOption(menuOptionId) {
          return (
            this.menuOptions.findIndex((menu) => menu.equals(menuOptionId)) !==
            -1
          );
        },
        async addPrivilege(privilegeId, commit = true) {
          if (!this.hasPrivilege(privilegeId)) {
            this.privileges.push(privilegeId);
            if (commit) await this.save();
          }
        },
        async addMenuOption(menuOptionId, commit = true) {
          if (!this.hasMenuOption(menuOptionId)) {
            this.menuOptions.push(menuOptionId);
            if (commit) await this.save();
          }
        },
        async deletePrivilege(privilegeId, commit = true) {
          if (this.hasPrivilege(privilegeId)) {
            this.privileges = this.privileges.filter(
              (privilege) => !privilege.equals(privilegeId)
            );
            if (commit) await this.save();
          }
        },
        async deleteMenuOption(menuOptionId, commit = true) {
          if (this.hasMenuOption(menuOptionId)) {
            this.menuOptions = this.menuOptions.filter(
              (menu) => !menu.equals(menuOptionId)
            );
            if (commit) await this.save();
          }
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

module.exports = Role;
