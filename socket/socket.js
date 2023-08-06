const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../auth/models/User");
const createSocketServer = (httpServer) => {
  const io = new Server(httpServer);
  const deliveryNameSpace = io.of("/delivery");

  deliveryNameSpace.use(async (socket, next) => {
    // ensure the user has sufficient rights
    const token = socket.handshake.query.token;
    if (!token)
      return { status: 401, detail: "Access Denied!No token provided" };
    try {
      const decoded = jwt.verify(token, config.get("jwt"));
      const userId = decoded._id;
      const user = await User.findOne({ _id: userId })
        .select("-password")
        .populate("roles");
      if (!user) return { status: 401, detail: "Invalid Token" };
      socket.user = user;
      next();
    } catch (err) {
      return { status: 401, detail: "Invalid Token" };
    }
    next();
  });

  deliveryNameSpace.on("connection", async (socket) => {
    // Handle a new user connecting
    socket.on("stream_location", (data) => {
      // console.log("User connected", socket.user);
      socket.broadcast.emit("stream_location", data);
      // console.log("User connected", new Date().toTimeString());
    });
  });
};

module.exports = {
  createSocketServer,
};
