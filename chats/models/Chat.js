const { model, Schema, Types } = require("mongoose");

const Chat = model(
  "Chat",
  new Schema(
    {
      messageType: {
        type: String,
        required: true,
        enum: ["image", "text"],
      },
      message: {
        type: String,
        required: true,
      },
      sender: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
      },
      event: {
        type: Types.ObjectId,
        required: true,
        ref: "ARTDistributionEvent",
      },
    },
    { timestamps: true }
  )
);

module.exports = Chat;
