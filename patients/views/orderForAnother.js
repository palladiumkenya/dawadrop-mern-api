const { Types } = require("mongoose");
const { getPatientAppointments } = require("../../appointments/api");
const { getValidationErrrJson } = require("../../utils/helpers");
const { searchPatient, getRegimen } = require("../api");
const Patient = require("../models/Patient");
const TreatmentSurport = require("../models/TreatmentSurport");
const { profileValidator } = require("../validators");
const { isEmpty } = require("lodash");

const verifyPatientAndAddAsCareReceiver = async (req, res) => {
  try {
    // vERIFY PATENT INFO
    const { cccNumber, firstName, upiNo } = await profileValidator(req.body);
    const remotePatient = await searchPatient(cccNumber);
    if (!remotePatient)
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (remotePatient.f_name.toLowerCase() !== firstName.toLowerCase())
      throw Error("Verification Error!\nCCC Number / First Name do not match");
    if (upiNo && remotePatient.upi_no !== upiNo)
      throw Error(
        "Verification Error!\nUPI Number / First Name / CCC Number do not match"
      );

    const patient = await Patient.getOrCreatePatientFromRemote(remotePatient);
    if (patient.user.equals(req.user._id)) {
      throw {
        status: 403,
        message: "Invalid Operation.Cant add yourself as careReceiver",
      };
    }
    // Check if asociation exists
    const asociation = await TreatmentSurport.findOne({
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    if (asociation) {
      asociation.canOrderDrug = true;
      await asociation.save();
      return res.json(await asociation.populate("careGiver careReceiver"));
    }
    // Create asociation
    const tSupport = new TreatmentSurport({
      canOrderDrug: true,
      careGiver: req.user._id,
      careReceiver: patient._id,
    });
    await tSupport.save();
    return res.json(await tSupport.populate("careGiver careReceiver"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const checkCareReceiverEligibility = async (req, res) => {
  try {
    const asocialtionId = req.query.careReceiver;
    if (!asocialtionId)
      throw {
        status: 400,
        message: '"careReceiver" query parameter is required',
      };
    if (
      !Types.ObjectId.isValid(asocialtionId) ||
      !(await TreatmentSurport.findOne({
        _id: asocialtionId,
        canOrderDrug: true,
        careGiver: req.user._id,
        careReceiver: { $exists: true, $ne: null },
      }))
    )
      throw {
        status: 400,
        message: "Invalid Care receiver",
      };
    const asociation = await TreatmentSurport.findById(asocialtionId);
    const patient = await Patient.findById(asociation.careReceiver);
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

    return res.json({ appointment, currentRegimen: currRegimen[0] });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = {
  verifyPatientAndAddAsCareReceiver,
  checkCareReceiverEligibility,
};
