const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const userRoutes = require("./users/routes");
dotenv.config();
const config = require("config");
console.log(`[-]App name: ${config.get("name")}`);
console.log(`[-]Database: ${config.get("db")}`);
mongoose
  .connect(config.get("db"))
  .then((result) => {
    console.log("[-]Connected to database Successfully");
  })
  .catch((err) => console.log("[x]Could not connect to database" + err));
const app = express();

app.use(express.json());
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  console.log("[-]Morgan Enabled");
}
app.use("/users", userRoutes);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port + " ....");
});
