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
const coreRoute = require("./core/routes");
const { createServer } = require("http");
dotenv.config();
const config = require("config");
const { MEDIA_ROOT, BASE_DIR } = require("./utils/constants");
const { createSocketServer } = require("./socket/socket");
const {
  generateRandomNumberInRange,
  parseMessage,
} = require("./utils/helpers");
console.log(`[-]App name: ${config.get("name")}`);
console.log(`[-]Database: ${config.get("db")}`);
const moment = require("moment/moment");
const fetchAndScheduleEventsNortification = require("./art/fetchAndScheduleEventsNortification");
var cors = require("cors");
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
app.use(cors());
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
app.use("/", coreRoute);
app.get("/data", (req, res) => {
  const appointmentType = [
    "Re-Fill",
    "Clinical Review",
    "PCR",
    "Lab Investigation",
  ];

  const data = [];
  for (let index = 0; index < 1000; index++) {
    const aptTyp = appointmentType[generateRandomNumberInRange(0, 4)];
    const apt = new Date(
      `${2023}-${generateRandomNumberInRange(
        5,
        9
      )}-${generateRandomNumberInRange(1, 30)}`
    ).toISOString();

    data.push({
      id: Number(`207235${index}`),
      cccNumber: ["1234500001", "1234500068"][
        generateRandomNumberInRange(0, 2)
      ],
      appointment_type: aptTyp,
      appointment_date: apt,
      date_attended: null,
      appointment: apt,
      next_appointment_date: moment(apt)
        // .add(10, "days")
        .add([30, 90, 120][generateRandomNumberInRange(0, 3)], "days")
        .toISOString(),
    });
  }
  return res.json(data);
});
fetchAndScheduleEventsNortification();
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log("[-]Server running on port " + port + " ....");
});
