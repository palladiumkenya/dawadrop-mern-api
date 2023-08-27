const { Types } = require("mongoose");
const {
  getValidationErrrJson,
  cleanFalsyAttributes,
} = require("../../utils/helpers");
const { merge } = require("lodash");
const { deliveryServiceRequestValidator } = require("../validators");
const DeliveryServiceRequest = require("../models/DeliveryServiceRequest");
const CourrierService = require("../../deliveries/models/CourrierService");
const DeliveryMethod = require("../../deliveries/models/DeliveryMethod");
const ARTDistributionEvent = require("../../art/models/ARTDistributionEvent");
const { getAppointment } = require("../../appointments/api");
const Patient = require("../../patients/models/Patient");
const TreatmentSurport = require("../../patients/models/TreatmentSurport");
const ARTDistributionGroupEnrollment = require("../../art/models/ARTDistributionGroupEnrollment");
const ARTDistributionGroup = require("../../art/models/ARTDistributionGroup");

const getDeliveryServiceRequest = async (req, res) => {
  const requests = await ARTDistributionModel.find();
  return res.json({ results: requests });
};

const getDeliveryServiceRequestDetail = async (req, res) => {
  const requestId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(requestId))
      throw {
        status: 404,
        message: "Delivery Service request not found",
      };
    const request = await DeliveryServiceRequest.findById(requestId);
    if (!request)
      throw {
        status: 404,
        message: "Delivery Service request not found",
      };
    return res.json(request);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateDeliveryServiceRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(requestId))
      throw {
        status: 404,
        message: "Delivery Service request not found",
      };
    let request = await DeliveryServiceRequest.findById(requestId);
    if (!request)
      throw {
        status: 404,
        message: "Delivery Service request not found",
      };
    const values = await deliveryServiceRequestValidator(req.body);
    request = merge(request, values);
    await request.save();
    return res.json(request);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};
const createDeliveryServiceRequest = async (req, res) => {
  try {
    const values = await deliveryServiceRequestValidator(req.body);
    const {
      courrierService,
      deliveryMethod,
      deliveryPerson,
      deliveryAddress,
      event,
      appointment,
      type,
      careReceiver,
    } = values;

    if (appointment && event)
      throw {
        status: 403,
        message: "Invalid Operation.Can't accept both appointment and event!",
      };
    if (!appointment && !event)
      throw {
        status: 403,
        message:
          "Invalid Operation.You must provide either event or appointment!",
      };
    if (type === "self" && !(await req.user.isPatient()))
      throw {
        status: 403,
        message: "Invalid Operation.You are not a valid patient!",
      };
    if (type === "other" && event)
      throw {
        status: 403,
        message:
          "Invalid Operation.You are not allowed to order for another using event!",
      };
    const _deliveryMethod = await DeliveryMethod.findById(deliveryMethod);

    let _courrierService;
    let _event;
    let _appointment;
    let _careReceiver;
    if (courrierService)
      _courrierService = await CourrierService.findById(courrierService);
    if (event) {
      // make sure user is member of group
      const event_ = await ARTDistributionEvent.findById(event);
      const subscription = await ARTDistributionGroupEnrollment.findOne({
        "group._id": event_.group._id,
        user: req.user._id,
      });
      if (subscription) _event = event_;
    }

    if (careReceiver) {
      const ts = await TreatmentSurport.findOne({
        careReceiver: careReceiver,
        canOrderDrug: true,
        careGiver: req.user._id,
      }); //ensure asociation exists
      if (ts)
        _careReceiver = await Patient.findOne({
          _id: careReceiver,
        }); //also make sure they bhave relationship
    }
    const errors = [];

    // Make sure eith address is typed or picked from map
    const { latitude, longitude, address } = deliveryAddress;
    if (!address && !(latitude && longitude))
      errors.push({
        path: ["deliveryAddress"],
        message: "Invalid Address",
      });

    if (!_deliveryMethod)
      errors.push({
        path: ["deliveryMethod"],
        message: "Invalid deliveryMethod",
      });
    //   IF dELIVERY METHOD BY COURRIER AND COURRIER OF CHOICE NOT PROVIDED
    if (_deliveryMethod?.blockOnTimeSlotFull === false && !_courrierService)
      errors.push({
        path: ["courrierService"],
        message: "Invalid courrierService or courrier service not provided",
      });
    // IF DELIVERY METHOD NOT BY CURRIOUR BT PERSON OR CURRIOR SERVICE PROVIDED THEN IGNORE THEM
    if (_deliveryMethod?.blockOnTimeSlotFull === true && deliveryPerson) {
      delete values.deliveryPerson;
      delete values.courrierService;
    }

    if (event && !_event)
      errors.push({
        path: ["event"],
        message: "Invalid Event",
      });

    if (type === "other" && !_careReceiver)
      errors.push({
        path: ["careReceiver"],
        message: "Invalid care receiver or care giver not provided",
      });
    const patient =
      type === "self"
        ? await Patient.findOne({ user: req.user._id })
        : _careReceiver;

    // Get delivery request owner appointment
    if (appointment)
      _appointment = await getAppointment(patient.cccNumber, appointment);

    if (appointment && !_appointment) {
      errors.push({
        path: ["appointment"],
        message: "Invalid Appointment",
      });
    }

    if (errors.length > 0)
      throw {
        details: errors,
      };

    const request = new DeliveryServiceRequest({
      ...cleanFalsyAttributes({
        ...values,
        appointment: _appointment,
        deliveryMethod: _deliveryMethod,
        event: _event,
        courrierService: _courrierService,
        orderedBy: req.user._id,
        patient,
      }),
    });
    await request.save();
    return res.json(request);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

module.exports = {
  getDeliveryServiceRequestDetail,
  getDeliveryServiceRequest,
  updateDeliveryServiceRequest,
  createDeliveryServiceRequest,
};
