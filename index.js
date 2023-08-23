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
const artRoute = require("./art/routes");
const { createServer } = require("http");
dotenv.config();
const config = require("config");
const { MEDIA_ROOT, BASE_DIR } = require("./utils/constants");
const { createSocketServer } = require("./socket/socket");
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
createSocketServer(httpServer);

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
app.use("/art", artRoute);
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log("[-]Server running on port " + port + " ....");
});
