const config = require("config");

const getPatientAppointments = async () => {
  const url = `${config.get("ushauri")}`;
  await fetch();
};
