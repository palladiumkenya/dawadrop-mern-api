const { Types } = require("mongoose");
const {
  getValidationErrrJson,
  cleanFalsyAttributes,
  parseMessage,
} = require("../../utils/helpers");
const { merge, template } = require("lodash");
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
const ARTDistributionEventFeedBack = require("../../art/models/ARTDistributionEventFeedBack");
const { sendSms } = require("../../patients/api");
const SmsConfig = require("../../core/models/SmsConfig");
const config = require("config")

const getDeliveryServiceRequest = async (req, res) => {
  const orders = await DeliveryServiceRequest.find();
  return res.json({ results: orders });
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

    let _courrierService;
    let _event;
    let _appointment;
    let _careReceiver;
    if (courrierService)
      _courrierService = await CourrierService.findById(courrierService);
    if (event) {
      // make sure user is member of group
      const event_ = await ARTDistributionEvent.findById(event);
      const patient = await Patient.findOne({ user: req.user._id });
      const subscription = await ARTDistributionGroupEnrollment.findOne({
        "group._id": event_.group._id,
        patient: patient._id,
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
    //   IF dELIVERY METHOD BY COURRIER AND COURRIER OF CHOICE NOT PROVIDED
    if (deliveryMethod === "in-parcel" && !_courrierService)
      errors.push({
        path: ["courrierService"],
        message: "Invalid courrierService or courrier service not provided",
      });
    // IF DELIVERY METHOD NOT BY CURRIOUR BT PERSON OR CURRIOR SERVICE PROVIDED THEN IGNORE THEM
    if (deliveryMethod === "in-person" && deliveryPerson) {
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
        event: _event,
        courrierService: _courrierService,
        orderedBy: req.user._id,
        patient,
      }),
    });
    await request.save();
    if (_event) {
      // get or create feedback
      let feedBack = await ARTDistributionEventFeedBack.findOne({
        event,
        user: req.user._id,
      });
      if (feedBack) {
        feedBack.confirmedAttendance = false;
        feedBack.deliveryRequest = request._id;
        await feedBack.save();
      } else {
        feedBack = await ARTDistributionEventFeedBack({
          event,
          user: req.user._id,
          deliveryRequest: request._id,
        });
        await feedBack.save();
      }
    }

    // Send sms of succesfull Order

    const orderDetail = {
      name: req.user.firstName || req.user.username,
      deliveryAddress: request.deliveryAddress?.address,
      phoneNumber: request.phoneNumber
    }

    const smsTemplate =  (
      await SmsConfig.findOne({
        smsType: "ORDER_SUCCESS",
      })
    )?.smsTemplate || config.get("sms.ORDER_SUCCESS");

    const message = parseMessage(orderDetail, smsTemplate)
    sendSms(message, req.user.phoneNumber)

    return res.json(request);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const getPendingDeliveryServiceRequest = async (req, res) => {
  const orders = await DeliveryServiceRequest.aggregate([
    {
      $lookup: {
        from: "deliveries",
        foreignField: "order",
        localField: "_id",
        as: "deliveries",
      },
    },
    {
      $addFields: {
        //TSB and currUser===careGiver
        priority: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$deliveryMethod.blockOnTimeSlotFull", false] },
                { $eq: ["$careGiver", req.user._id] },
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    // flag when there already exist deliveries
    {
      $addFields: {
        hasDeliveryAndAllCanceled: {
          $cond: {
            if: {
              $and: [
                { $ne: [{ $size: "$deliveries" }, 0] }, // Check if deliveries array is not empty
                {
                  $eq: [
                    {
                      $size: {
                        $setIntersection: ["$deliveries.status", ["canceled"]],
                      },
                    },
                    { $size: "$deliveries" },
                  ],
                }, // Check if all deliveries have "canceled" status
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $addFields: {
        asignedToCurrentUserOrNoneTSB: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$deliveryMethod.blockOnTimeSlotFull", true] }, //None TSB
                { $eq: ["$priority", true] }, // assigned to current user
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    // handle when no deliveries yet
    {
      $addFields: {
        noAsociatedDeliveryANDasignedToCurrentUserOrNoneTSB: {
          $cond: {
            if: {
              $and: [
                { $eq: [{ $size: "$deliveries" }, 0] }, // No asociated delivery
                { $eq: ["$asignedToCurrentUserOrNoneTSB", true] }, // nONE tsb or assighrned to current user
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { hasDeliveryAndAllCanceled: true },
          { noAsociatedDeliveryANDasignedToCurrentUserOrNoneTSB: true },
        ],
      },
    },
  ]);
  return res.json({ results: orders });
};

module.exports = {
  getDeliveryServiceRequestDetail,
  getDeliveryServiceRequest,
  updateDeliveryServiceRequest,
  createDeliveryServiceRequest,
  getPendingDeliveryServiceRequest,
};
