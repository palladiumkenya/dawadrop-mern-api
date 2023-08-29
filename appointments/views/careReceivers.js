const Patient = require("../../patients/models/Patient");
const TreatmentSurport = require("../../patients/models/TreatmentSurport");
const { getValidationErrrJson } = require("../../utils/helpers");
const { getPatientAppointments } = require("../api");
const moment = require("moment/moment");

const getCareReceiverUpcomingAppointments = async (req, res) => {
  const cccNumber = req.params.cccNumber;
  try {
    if (!cccNumber)
      throw {
        status: 400,
        message: "You must specify the care receiver cccNumber",
      };
    const patient = await Patient.findOne({ cccNumber });
    if (!patient) throw { status: 404, message: "Care receiver not found" };
    const support = await TreatmentSurport.findOne({
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    if (!support) throw { status: 404, message: "Care receiver not found" };

    const appointments = (await getPatientAppointments(cccNumber)) || [];
    return res.json({
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
          return daysDiff >= 0 && daysDiff <= 7;
        }),
    });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const getAllMyCareReceiversUpcomingAppointments = async (req, res) => {
  try {
    const support = await TreatmentSurport.find({
      careGiver: req.user._id,
    });
    const patients = await Patient.find({
      _id: { $in: support.map((s) => s.careReceiver) },
    });
    let appointments = [];
    for (const patient of patients) {
      const apt = await getPatientAppointments(patient.cccNumber);
      appointments = [
        ...appointments,
        ...apt.filter(({ next_appointment_date }) => {
          const daysDiff = moment(next_appointment_date).diff(
            new Date(),
            "days"
          );
          return daysDiff >= 0 && daysDiff <= 7;
        }),
      ];
    }
    return res.json({
      results: appointments.sort((a, b) => {
        const nextAppointmentDateA = moment(a.next_appointment_date);
        const nextAppointmentDateB = moment(b.next_appointment_date);
        return nextAppointmentDateA - nextAppointmentDateB;
      }),
    });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getCareReceiverUpcomingAppointments,
  getAllMyCareReceiversUpcomingAppointments,
};
