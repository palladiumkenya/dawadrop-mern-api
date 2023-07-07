const { model, Schema } = require("mongoose");

module.exports = model(
  "TimeSlot",
  new Schema({
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  })
);
