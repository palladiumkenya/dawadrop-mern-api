const { Types } = require("mongoose");
const { getValidationErrrJson, parseMessage } = require("../../utils/helpers");
const { merge, omit, includes } = require("lodash");
const { deliveryValidator } = require("../validators");
const Delivery = require("../models/Delivery");
const Patient = require("../../patients/models/Patient");
const { initiateDeliveryValidator } = require("../../art/validators");
const DeliveryServiceRequest = require("../../orders/models/DeliveryServiceRequest");
const CourrierService = require("../models/CourrierService");
const ARTDistributionEvent = require("../../art/models/ARTDistributionEvent");
const User = require("../../auth/models/User");
const { sendSms } = require("../../patients/api");
const SmsConfig = require("../../core/models/SmsConfig");
const config = require("config");

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
          from: "users",
          foreignField: "_id",
          localField: "initiatedBy",
          as: "initiatedBy",
        },
      },
      {
        $addFields: {
          deliveryAddress: {
            $ifNull: ["$deliveryAddress.address", "$order.deliveryAddress.address"]
          }
        }
      }
      
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
            { initiatedBy: req.user._id, include: true },
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
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "initiatedBy",
          as: "initiatedBy",
        },
      },
      {
        $addFields: {
          deliveryAddress: {
            $ifNull: ["$deliveryAddress.address", "$order.deliveryAddress.address"]
          }
        }
      }
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
    const values = await initiateDeliveryValidator(req.body);
    const {
      event: eventId,
      order: orderId,
      member,
      courrierService: serviceId,
      deliveryType,
    } = values;
    let event;
    let order;
    let courrierService;
    let patient;
    if (eventId) {
      event = await ARTDistributionEvent.findById(eventId);
      if (!event)
        throw {
          errors: [
            {
              path: ["event"],
              message: "Invalid Event",
            },
          ],
        };
    }
    if (deliveryType !== "courrier") delete values.courrierService;
    if (serviceId) {
      courrierService = await CourrierService.findById(values.courrierService);
      if (!courrierService)
        throw {
          details: [
            {
              path: ["courrierService"],
              message: "Invalid courrierService",
            },
          ],
        };
    }
    if (event && member) {
      patient = await Patient.findById(member);
      if (!patient)
        throw {
          details: [
            {
              path: ["member"],
              message: "Invalid Member",
            },
          ],
        };
    }

    // If Order the set patient/subscriber to order owner
    if (orderId) {
      order = await DeliveryServiceRequest.findById(orderId);
      if (!order)
        throw {
          details: [
            {
              path: ["order"],
              message: "Invalid order",
            },
          ],
        };
      patient = await Patient.findById(order.patient);
    }
    if (["patient-preferred", "self"].includes(deliveryType)) {
      delete values.deliveryPerson;
    }
    if (["patient-preferred"].includes(deliveryType)) {
      delete values.deliveryAddress;
    }
    // del person, del address
    const delivery = new Delivery({
      ...values,
      courrierService,
      patient: patient._id,
      event: event?._id,
      order: order?._id,
      initiatedBy: req.user._id,
    });

    await delivery.save();
    // Sending sms only for smartphone users

    const user = await User.findById(patient.user);
    const deliveryDetails = {
      name: user?.firstName || user?.username,
      code: delivery._id,
      customer_support: "0793889658",
    };

    const template =
      (
        await SmsConfig.findOne({
          smsType: "DELIVERY_INITIATION",
        })
      )?.smsTemplate || config.get("sms.DELIVERY_INITIATION");

    const message = parseMessage(deliveryDetails, template);

    if (user) {
      sendSms(message, user.phoneNumber);
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
  /*
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
  );*/
  const _delivery = await Delivery.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(req.params.id),
      },
    },
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
        from: "users",
        foreignField: "_id",
        localField: "initiatedBy",
        as: "initiatedBy",
      },
    },
    {
      $addFields: {
        deliveryAddress: {
          $ifNull: ["$deliveryAddress.address", "$order.deliveryAddress.address"]
        }
      }
    }
    // {
    //   $addFields: {
    //     phoneNumber:
    //   },
    // },
  ]);
  const delivery = _delivery[0];
  if (!delivery) {
    return res.status(404).json({ detail: "Delivery  not found" });
  }
  return res.json(delivery);
};
module.exports = {
  getDeliveries,
  getMyDeliveriesHistory,
  updateDelivery,
  deliveryAction,
  getDeliveryDetail,
  initiateDelivery,
};
