const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authRoutes = require("./auth/routes");
const patientRoute = require("./patients/routes");
const providorAppointmentRoute = require("./appointments/routes");
const deliveryRoutes = require("./deliveries/routes");
const ordersRoutes = require("./orders/routes");
const mapsRoute = require("./maps/routes");
const { Server } = require("socket.io");
const { createServer } = require("http");
dotenv.config();
const config = require("config");
const { MEDIA_ROOT, BASE_DIR } = require("./utils/constants");
console.log(`[-]App name: ${config.get("name")}`);
console.log(`[-]Database: ${config.get("db")}`);

mongoose
  .connect(config.get("db"))
  .then((result) => {
    console.log("[-]Connected to database Successfully");
  })
  .catch((err) => {
    console.log("[x]Could not connect to database" + err);
    process.exit(1); // Exit the application on database connection error
  });
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const connectedUsers = [];

io.on("connection", (socket) => {
  // console.log("A user connected!");

  // Handle a new user connecting
  socket.on("join", (user) => {
    connectedUsers.push({ socketId: socket.id, user });
    console.log("User connected:", user);
    io.emit("join", "Welcome" + user);
    io.emit(
      "connected_users",
      connectedUsers.map((u) => u.user)
    );
  });

  // Handle incoming chat messages
  socket.on("chat_message", (message) => {
    console.log("Received message:", message);
    io.emit("chat_message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected!");
    const disconnectedUser = connectedUsers.find(
      (u) => u.socketId === socket.id
    );
    if (disconnectedUser) {
      const index = connectedUsers.indexOf(disconnectedUser);
      connectedUsers.splice(index, 1);
      io.emit(
        "connected_users",
        connectedUsers.map((u) => u.user)
      );
    }
  });
});

app.use(express.json());
app.use(express.static(`${BASE_DIR}/${MEDIA_ROOT}`));
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  console.log("[-]Morgan Enabled");
}
app.use("/auth", authRoutes);
app.use("/patients", patientRoute);
app.use("/appointments", providorAppointmentRoute);
app.use("/deliveries", deliveryRoutes);
app.use("/orders", ordersRoutes);
app.use("/maps", mapsRoute);
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log("[-]Server running on port " + port + " ....");
});
