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
        async addPrivilege(privilegeId, commit = true) {
          if (!this.hasPrivilege(privilegeId)) {
            this.privileges.push(privilegeId);
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
      },
    }
  )
);

module.exports = Role;
