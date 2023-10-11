const Patient = require("../models/Patient");
const {
  getPatientAppointments: getPatientRemoteAppointments,
} = require("../../appointments/api");
const { isEmpty } = require("lodash");
const moment = require("moment/moment");
const getPatientAppointments = async (req, res) => {
  const query = req.params;
  const patient = await Patient.findOne({ user: req.user._id });
  const appointments = await getPatientRemoteAppointments(patient.cccNumber);
  if (isEmpty(appointments)) return res.json({ results: [] });
  else
    res.json({
      results: appointments
        .sort((a, b) => {
          const nextAppointmentDateA = moment(a.next_appointment_date);
          const nextAppointmentDateB = moment(b.next_appointment_date);
          return nextAppointmentDateA - nextAppointmentDateB;
        })
        .filter(({ next_appointment_date }) => {
          const daysDiff = moment(next_appointment_date).diff(
            new Date(),
            "days"
          );
          const upComing = query.upComing === "true";

          if (!upComing) {
            return daysDiff >= 0 && daysDiff <= 7;
          } else {
            return true;
          }
        }),

      // .sort(
      //   (a, b) =>
      //     moment(a.next_appointment_date).diff(new Date()) -
      //     moment(b.next_appointment_date).diff(new Date())
      // ),
    });
  // res.json(base64Decode("Mg=="));
};

const getAppointmentDetail = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  const appointments =
    (await getPatientRemoteAppointments(patient.cccNumber)) || [];
  const appointment = appointments.find((apt) => `${apt.id}` === req.params.id);
  if (!appointment) {
    res.status(404).json({ detail: "Appointment not found" });
  } else res.json(appointment);
  // res.json(base64Decode("Mg=="));
};
module.exports = { getPatientAppointments, getAppointmentDetail };
