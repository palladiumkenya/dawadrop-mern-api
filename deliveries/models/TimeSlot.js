const { model, Schema } = require("mongoose");

const TimeSlot = model(
  "TimeSlot",
  new Schema(
    {
      startTime: {
        type: Schema.Types.Date,
        required: true,
      },
      endTime: {
        type: Schema.Types.Date,
        required: true,
      },
      capacity: {
        type: Number,
      },
      label: {
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

module.exports = TimeSlot;
