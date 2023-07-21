const { model, Schema } = require("mongoose");

const MenuOption = model(
  "MenuOption",
  new Schema(
    {
      label: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
    },
    {
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

module.exports = MenuOption;
