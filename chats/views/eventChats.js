const { Types } = require("mongoose");
const ARTDistributionEvent = require("../../art/models/ARTDistributionEvent");
const {
  getValidationErrrJson,
  deleteUploadedFileAsyncMannual,
} = require("../../utils/helpers");
const Chat = require("../models/Chat");
const { chatValidator } = require("../validators");
const { CHATS_MEDIA } = require("../../utils/constants");

const getEventChats = async (req, res) => {
  const eventId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(eventId))
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    const event = await ARTDistributionEvent.findById(eventId);
    if (!event)
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };

    const chats = await Chat.aggregate([
      {
        $match: {
          event: event._id,
        },
      },
      {
        $lookup: {
          from: "artdistributionevents",
          foreignField: "_id",
          localField: "event",
          as: "event",
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "sender",
          as: "sender",
        },
      },
    ]);
    return res.json({ results: chats });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const addChat = async (req, res) => {
  const eventId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(eventId))
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    const event = await ARTDistributionEvent.findById(eventId);
    if (!event)
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    //   Make sure user is scribers
    const body = req.body;
    if (req.file) {
      body.messageType = "image";
      body.message = `/${CHATS_MEDIA}${req.file.filename}`;
    } else {
      body.messageType = "text";
    }
    const values = await chatValidator(body);
    const chats = new Chat({ ...values, event: eventId, sender: req.user._id });
    await chats.save();
    return res.json(chats);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    if (req.file) await deleteUploadedFileAsyncMannual(req.file.path);
    return res.status(status).json(err);
  }
};

const deleteChat = async (req, res) => {
  const chatId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(chatId))
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    const chat = await Chat.findOne({ _id: chatId, sender: req.user._id });
    if (!chat)
      throw {
        status: 404,
        message: "ART Distribution Event not found",
      };
    await chat.deleteOne();
    return res.json(chat);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = { addChat, deleteChat, getEventChats };
