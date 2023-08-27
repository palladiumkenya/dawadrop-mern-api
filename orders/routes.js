const { Router } = require("express");
const auth = require("../middleware/auth");
const isValidPatient = require("../middleware/isValidPatient");
const Patient = require("../patients/models/Patient");
const DeliveryRequest = require("./models/DeliveryRequest");
const { orderValidator } = require("./validators");
const { getValidationErrrJson, isValidDate } = require("../utils/helpers");
const { Schema, Types } = require("mongoose");
const Delivery = require("../deliveries/models/Delivery");
const { isEmpty } = require("lodash");

const router = Router();

router.get("/", [auth], async (req, res) => {
  const orders = await DeliveryRequest.find();
  return res.json({ results: orders });
});
router.get("/pending", [auth], async (req, res) => {
  const orders = await DeliveryRequest.aggregate([
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
});
router.get("/dispense", [auth], async (req, res) => {
  try {
    const search = req.query.search;
    if (!Types.ObjectId.isValid(search))
      throw {
        status: 404,
        message: "No DeliveryRequest or delivery found!",
      };

    const delivery = await Delivery.findById(search);
    const orderId = (delivery ? delivery.order.toString() : null) || search;
    const order = await DeliveryRequest.aggregate([
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
        message: "No DeliveryRequest or delivery found!",
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
        message: "Invalid DeliveryRequest.couldn't depense!",
      };
    const order = await DeliveryRequest.findById(payload.order);
    if (!order)
      throw {
        status: 404,
        message: "Invalid DeliveryRequest.couldn't depense!",
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
    const order = new DeliveryRequest(valid);
    await order.save();
    return res.json(await order.populate("patient"));
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.get("/:id", [auth, isValidPatient], async (req, res) => {
  const order = await DeliveryRequest.findById(req.params.id);
  if (!order)
    return res.status(404).json({ detail: "DeliveryRequest not found" });
  return res.json({ results: await order.populate("patient") });
});

module.exports = router;
