const { model, Schema } = require("mongoose");

const MenuOption = model(
  "MenuOption",
  new Schema({
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
  })
);

module.exports = MenuOption;
