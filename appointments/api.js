const config = require("config");
const moment = require("moment/moment");
const { generateRandomNumberInRange } = require("../utils/helpers");

const getAppointment = async (ccNumber, appointmenId) => {
  return {
    id: appointmenId,
    cccNumber: ccNumber,
    appointment_type: "Re-Fill",
    appointment_date: moment().subtract(87, "days").toISOString(),
    date_attended: null,
    appointment: moment().subtract(87, "days").toISOString(),
    next_appointment_date: moment().add(3, "days").toISOString(),
  };
};

const getPatientAppointments = async (cccNumber) => {
  try {
    const appointmentType = [
      "Re-Fill",
      "Clinical Review",
      "PCR",
      "Lab Investigation",
    ];

    const data = [];
    for (let index = 0; index < 500; index++) {
      const aptTyp = appointmentType[generateRandomNumberInRange(0, 3)];
      const apt = new Date(
        `${2023}-${generateRandomNumberInRange(
          5,
          9
        )}-${generateRandomNumberInRange(1, 30)}`
      ).toISOString();

      data.push({
        id: Number(`207235${index}`),
        cccNumber: [
          "1234500001",
          "1234500068",
          "1234500002",
          "1234500003",
          "1234500004",
        ][generateRandomNumberInRange(0, 5)],
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
    return data.filter(({ cccNumber: cc }) => cc === cccNumber);

    // const url = `${config.get("nishauri")}appointments?ccc_no=${cccNumber}`;
    // const response = await fetch(url);
    // if (response.status === 200) {
    //   const appointments = await response.json();
    //   if (appointments.success) {
    //     return appointments.data;
    //   }
    // }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  getPatientAppointments,
  getAppointment,
};
