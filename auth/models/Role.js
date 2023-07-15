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
    }
  )
);

module.exports = Role;
