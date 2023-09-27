const { Types } = require("mongoose");
const { getValidationErrrJson } = require("../../utils/helpers");
const { merge, omit, includes } = require("lodash");
const { deliveryValidator } = require("../validators");
const Delivery = require("../models/Delivery");
const Patient = require("../../patients/models/Patient");
const { initiateDeliveryValidator } = require("../../art/validators");
const DeliveryServiceRequest = require("../../orders/models/DeliveryServiceRequest");
const CourrierService = require("../models/CourrierService");
const ARTDistributionEvent = require("../../art/models/ARTDistributionEvent");

const getDeliveries = async (req, res) => {
  try {
    const methods = await Delivery.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "patients",
          foreignField: "_id",
          localField: "patient",
          as: "patient",
        },
      },
      {
        $lookup: {
          from: "artdistributionevents",
          foreignField: "_id",
          localField: "event",
          as: "event",
        },
      },
      {
        $lookup: {
          from: "deliveryfeedbacks",
          foreignField: "delivery",
          localField: "_id",
          as: "feedBack",
        },
      },
    ]);
    return res.json({ results: methods });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const getMyDeliveriesHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const methods = await Delivery.aggregate([
      {
        $lookup: {
          from: "deliveryservicerequests",
          foreignField: "_id",
          localField: "order",
          as: "order",
        },
      },
      {
        $lookup: {
          from: "artdistributionevents",
          foreignField: "_id",
          localField: "event",
          as: "event",
        },
      },
      {
        $match: {
          $or: [
            { patient: patient?._id, include: patient },
            { "order.orderedBy": req.user._id, include: true },
            { "event.group.lead.user": req.user._id, include: true },
          ]
            .filter((f) => f.include)
            .map((f) => omit(f, ["include"])),
        },
      },

      {
        $lookup: {
          from: "patients",
          foreignField: "_id",
          localField: "patient",
          as: "patient",
        },
      },
      {
        $lookup: {
          from: "deliveryfeedbacks",
          foreignField: "delivery",
          localField: "_id",
          as: "feedBack",
        },
      },
      // {
      //   $addFields: {
      //     phoneNumber:
      //   },
      // },
    ]);
    return res.json({ results: methods });
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const initiateDelivery = async (req, res) => {
  try {
    const errors = [];
    const values = await initiateDeliveryValidator(req.body);
    const {
      event: eventId,
      order: orderId,
      member,
      courrierService,
      deliveryType,
    } = values;
    // make sure both event and order are not peovided && make sure that both event and order are not missing
    if ((eventId && orderId) || (!eventId && !orderId)) {
      errors.push({
        path: ["event"],
        message:
          "You must provide either event or delivery request and not both",
      });
      errors.push({
        path: ["order"],
        message:
          "You must provide either event or delivery request and not both",
      });
    }
    if (eventId) {
      const _event = await ARTDistributionEvent.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(eventId),
          },
        },
        {
          $lookup: {
            from: "artdistributiongroupenrollments",
            foreignField: "group._id",
            localField: "group._id",
            as: "subscriptions",
          },
        },
        {
          $lookup: {
            from: "patients",
            foreignField: "_id",
            localField: "subscriptions.patient",
            as: "patientSubscribers",
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "patientSubscribers.user",
            as: "subscribers",
          },
        },
        {
          $lookup: {
            from: "artdistributioneventfeedbacks",
            foreignField: "event",
            localField: "_id",
            as: "feedBacks",
          },
        },
        {
          $lookup: {
            from: "deliveryservicerequests",
            foreignField: "_id",
            localField: "feedBacks.deliveryRequest",
            as: "deliveryRequests",
          },
        },
      ]);
      const event = _event[0];
      if (!event)
        errors.push({
          path: ["event"],
          message: "Invalid event.Event does not exist",
        });
      if (event && !member)
        errors.push({
          path: ["member"],
          message: "Subscriber field is required",
        });
        // if(event && member.)
      const patient = await Patient.findById(member);
      if (!patient)
        errors.push({
          path: ["member"],
          message: "Invalid Subscriber.Subscriber does not exist",
        });
      const { feedBacks, patientSubscribers, deliveryRequests } = event;
      // get current subscriber feedback on event
      const feedBack = feedBacks.find(
        ({ user }) =>
          user ===
          patientSubscribers.find(({ _id }) => _id.equals(patient._id))?.user
      );
      // Get current user delivery request if they requested home delivery
      const deliveryRequest = deliveryRequests.find(({ _id }) =>
        _id.equals(feedBack?.deliveryRequest)
      );
      // If subscriber make a request intead of confirming atendance then allow patient-preferred method
      if (feedBack?.confirmedAttendance === false) {
        if (
          !["self", "courrier", "delegate", "patient-preferred"].includes(
            deliveryType
          )
        )
          errors.push({
            path: ["deliveryType"],
            message:
              "Unsupotered Delivery type.Must be one of " +
              ["self", "courrier", "delegate", "patient-preferred"].join(", "),
          });
      }
      // If subscriber did not request delivery
      if (feedBack?.confirmedAttendance === true) {
        if (!["self", "courrier", "delegate"].includes(deliveryType))
          errors.push({
            path: ["deliveryType"],
            message:
              "Unsupotered Delivery type.Must be one of " +
              ["self", "courrier", "delegate"].join(", "),
          });
      }
    }
    if (orderId) {
      const deliveryRequest = await DeliveryServiceRequest.findById(orderId);
      if (!deliveryRequest)
        errors.push({
          path: ["order"],
          message: "Invalid Delivery request.Request does not exist",
        });
    }

    if (deliveryType === "courrier" && !courrierService)
      errors.push({
        path: ["courrierService"],
        message: "Cuourrier service is required",
      });
    if (courrierService) {
      const service = await CourrierService.findById(courrierService);
      if (!service)
        errors.push({
          path: ["courrierService"],
          message: "Invalid Courrier service",
        });
    }
    let service;

    const delivery = new Delivery({
      ...values,
      courrierService: service,
      patient,
      event: eventId,
    });

    await delivery.save();
    // Sending only for smartphone users
    const user = await User.findById(patient.user);
    if (user) {
      sendSms(
        `Dear ${
          user.firstName || user.username
        }, your delivery has been initiated.Kindly use the code: ${
          delivery._id
        }.`,
        user.phoneNumber
      );
    }
    return res.json({ detail: "Confirmed successfull!" });
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
};

const updateDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      throw {
        status: 404,
        message: "Delivery not Found!",
      };
    const value = await deliveryValidator(req.body);
    delivery = merge(delivery, value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const deliveryAction = async (req, res) => {
  try {
    const data = req.body;
    let delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      throw {
        status: 404,
        message: "Delivery not found!",
      };
    if (Boolean(delivery.status) && delivery.status !== "pending")
      throw {
        status: 403,
        message: "Action not surported!",
      };
    data.order = delivery.order.toString();
    if (delivery.dispencedBy) {
      data.dispencedBy = delivery.dispencedBy.toString();
    }
    data.deliveredBy = delivery.deliveredBy.toString();
    if (req.params.action === "start") {
      data.status = "pending";
    }
    if (req.params.action === "end") {
      data.status = "delivered";
    }
    const value = await deliveryValidator(data);
    delivery = merge(delivery, value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const getDeliveryDetail = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate(
    // "dispencedBy",
    // "deliveredBy",
    [
      {
        path: "order",
        model: "DeliveryServiceRequest",
        select:
          "patient deliveryAddress deliveryTimeSlot deliveryMode phoneNumber",
      },
      {
        path: "deliveredBy",
        model: "User",
        select: "username email phoneNumber image",
      },
      {
        path: "dispencedBy",
        model: "User",
        select: "username email phoneNumber image",
      },
    ]
  );
  if (!delivery) {
    return res.status(404).json({ detail: "Delivery  not found" });
  }
  return res.json(delivery);
};
module.exports = {
  getDeliveries,
  getMyDeliveriesHistory,
  createDelivery,
  updateDelivery,
  deliveryAction,
  getDeliveryDetail,
};
