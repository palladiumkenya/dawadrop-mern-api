const { Router } = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { CHATS_MEDIA } = require("../utils/constants");
const { addChat, getEventChats, deleteChat } = require("./views/eventChats");

const router = Router();

router.get("/:id", auth, getEventChats);
router.post(
  "/:id",
  [auth, upload({ dest: CHATS_MEDIA }).single("message")],
  addChat
);
router.delete("/:id", auth, deleteChat);

module.exports = router;
