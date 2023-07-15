const { model, Schema } = require("mongoose");

const MenuOption = model(
  "MenuOption",
  new Schema({
    label: {
      type: String,
      required: true,
      unique: true,
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
