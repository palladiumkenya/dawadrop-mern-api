const { Router } = require("express");
const auth = require("../middleware/auth");
const isValidPatient = require("../middleware/isValidPatient");
const Patient = require("../patients/models/Patient");
const Order = require("./models/Order");
const { orderValidator } = require("./validators");
const { getValidationErrrJson, isValidDate } = require("../utils/helpers");
const { Schema, Types } = require("mongoose");
const Delivery = require("../deliveries/models/Delivery");
const { isEmpty } = require("lodash");

const router = Router();

router.get("/", [auth], async (req, res) => {
  const orders = await Order.find();
  return res.json({ results: orders });
});
router.get("/pending", [auth], async (req, res) => {
  const orders = await Order.aggregate([
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
    {
      $match: {
        $or: [
          { deliveries: { $size: 0 } }, // Include orders with no deliveries
          { "deliveries.status": "canceled" }, // Include orders with canceled deliveries
        ],
        $and: [
          { priority: true }, //include orders with tsb and for current user as careGiver
        ],
      },
    },
    {
      $match: {
        $and: [
          { "deliveryMethod.blockOnTimeSlotFull": false }, // Exclude those with community ART}
        ],
      },
    },
    {
      $project: {
        blockOnTimeSlotFull: 0,
      },
    },
  ]);
  return res.json({ results: orders });
});
router.get("/dispense", [auth], async (req, res) => {
  try {
    const search = req.query.search;
    if (!Types.ObjectId.isValid(search))
      throw {
        status: 404,
        message: "No Order or delivery found!",
      };

    const delivery = await Delivery.findById(search);
    const orderId = (delivery ? delivery.order.toString() : null) || search;
    const order = await Order.aggregate([
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
        message: "No Order or delivery found!",
      };
    return res.json(await order[0]);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.post("/dispense", [auth], async (req, res) => {
  try {
    const payload = req.body;
    if (!Types.ObjectId.isValid(payload.order))
      throw {
        status: 404,
        message: "Invalid Order.couldn't depense!",
      };
    const order = await Order.findById(payload.order);
    if (!order)
      throw {
        status: 404,
        message: "Invalid Order.couldn't depense!",
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
});
router.post("/", [auth], async (req, res) => {
  try {
    const valid = await orderValidator(req.body);
    if (!Types.ObjectId.isValid(valid.patient)) {
      throw {
        status: 404,
        message: "Patient Not Found",
      };
    }
    const patient = await Patient.findById(valid.patient);
    if (!patient) {
      throw {
        status: 404,
        message: "Patient Not Found",
      };
    }
    const order = new Order(valid);
    await order.save();
    return res.json(await order.populate("patient"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.get("/:id", [auth, isValidPatient], async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ detail: "Order not found" });
  return res.json({ results: await order.populate("patient") });
});

module.exports = router;
