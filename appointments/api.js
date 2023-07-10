const config = require("config");

const getPatientAppointments = async (cccNumber) => {
  const url = `${config.get("nishauri")}appointments?ccc_no=${cccNumber}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const appointments = await response.json();
    if (appointments.success) {
      return appointments.data;
    }
  }
};

module.exports = {
  getPatientAppointments,
};
