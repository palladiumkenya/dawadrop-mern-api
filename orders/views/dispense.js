const { Types } = require("mongoose");
const { getValidationErrrJson, isValidDate } = require("../../utils/helpers");
const { merge, isEmpty } = require("lodash");
const {} = require("../validators");
const DeliveryServiceRequest = require("../models/DeliveryServiceRequest");
const Delivery = require("../../deliveries/models/Delivery");

const getDispenseOrder = async (req, res) => {
  try {
    const search = req.query.search;
    if (!Types.ObjectId.isValid(search))
      throw {
        status: 404,
        message: "No DeliveryServiceRequest or delivery found!",
      };

    const delivery = await Delivery.findById(search);
    const orderId = (delivery ? delivery.order.toString() : null) || search;
    const order = await DeliveryServiceRequest.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "deliveries",
          foreignField: "order",
          localField: "_id",
          as: "deliveries",
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
    ]);
    if (isEmpty(order))
      throw {
        status: 404,
        message: "No DeliveryServiceRequest or delivery found!",
      };
    return res.json(await order[0]);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const dispenseDrug = async (req, res) => {
  try {
    const payload = req.body;
    if (!Types.ObjectId.isValid(payload.order))
      throw {
        status: 404,
        message: "Invalid DeliveryServiceRequest.couldn't depense!",
      };
    const order = await DeliveryServiceRequest.findById(payload.order);
    if (!order)
      throw {
        status: 404,
        message: "Invalid DeliveryServiceRequest.couldn't depense!",
      };
    if (!isValidDate(payload.nextAppointmentDate))
      throw {
        status: 403,
        message: "Invalid next appointment date",
      };
    order.isDispensed = true;
    console.log(payload.nextAppointmentDate);
    // Netx appointment date be saved in Kenya EMR APPOINTMENT
    await order.save();
    return res.json(order);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = { getDispenseOrder, dispenseDrug };
