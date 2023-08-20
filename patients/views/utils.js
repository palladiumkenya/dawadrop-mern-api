const { getPatientAppointments } = require("../../appointments/api");
const DeliveryMethod = require("../../deliveries/models/DeliveryMethod");
const { patientOrderValidator } = require("../../orders/validators");
const { getRegimen } = require("../api");
const Patient = require("../models/Patient");
const { isEmpty } = require("lodash");
const TreatmentSurport = require("../models/TreatmentSurport");

const validateOrder = async (patientId, data) => {
  const patient = await Patient.findOne({ _id: patientId });
  const values = await patientOrderValidator(data);
  // 1. Get patient refill appointments
  const appoinments = await getPatientAppointments(patient.cccNumber);
  const latest = appoinments
    .filter((apt) => apt.appointment_type === "Re-Fill")
    .sort((a, b) => {
      const dateA = new Date(a.appointment.split("-").reverse().join("-"));
      const dateB = new Date(b.appointment.split("-").reverse().join("-"));
      return dateB - dateA;
    });
  if (isEmpty(latest)) {
    throw {
      status: 404,
      message: "No appointments",
    };
  }
  const appointment = latest[0];
  // 2. Check if user is eligible for appoinment based on last appointment refill
  // 3. Get current Regimen
  const currRegimen = await getRegimen(patient.cccNumber);
  if (isEmpty(currRegimen)) {
    throw {
      status: 404,
      message: "You must be subscribed to regimen",
    };
  }

  // 4.Get the delivery method and look for caregiver if treatment surport budding
  const method = await DeliveryMethod.findById(values["deliveryMethod"]);
  if (!method)
    throw {
      details: [
        { path: ["deliveryMethod"], message: "Invalid delivery method" },
      ],
    };
  // make sure care care giver is specified if methood is treatment surport budding
  let treatmentSupport;
  if (method.blockOnTimeSlotFull === false) {
    if (!values["careGiver"])
      throw {
        details: [
          {
            path: ["careGiver"],
            message: "Caregiver is required",
          },
        ],
      };
    treatmentSupport = await TreatmentSurport.findOne({
      _id: values["careGiver"],
      canPickUpDrugs: true,
      careReceiver: patient._id,
    });
    if (!treatmentSupport)
      throw {
        details: [
          {
            path: ["careGiver"],
            message: "Invalid care giver",
          },
        ],
      };
  }

  return {
    values,
    method,
    appointment,
    regimen: currRegimen[0].regimen,
    treatmentSupport,
  };
};

const eligibityTest = async (patientId) => {
  const patient = await Patient.findById(patientId);
  const appoinments = await getPatientAppointments(patient.cccNumber);

  const latest = appoinments
    .filter((apt) => apt.appointment_type === "Re-Fill")
    .sort((a, b) => {
      const dateA = new Date(a.appointment.split("-").reverse().join("-"));
      const dateB = new Date(b.appointment.split("-").reverse().join("-"));
      return dateB - dateA;
    });
  if (isEmpty(latest)) {
    throw {
      status: 404,
      message: "The patient have no appointmet",
    };
  }
  const appointment = latest[0];
  // 2. Check if user is eligible for appoinment based on last appointment refill
  // 3. Get current Regimen
  const currRegimen = await getRegimen(patient.cccNumber);
  if (isEmpty(currRegimen)) {
    throw {
      status: 404,
      message: "You must be subscribed to regimen",
    };
  }
  return { appointment, currentRegimen: currRegimen[0] };
};

module.exports = { validateOrder, eligibityTest };
