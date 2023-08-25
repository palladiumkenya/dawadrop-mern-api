const { Router } = require("express");
const Mode = require("./models/Mode");
const {
  modeValidator,
  timeSlotValidator,
  deliveryMethodValidator,
  deliveryValidator,
} = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const TimeSlot = require("./models/TimeSlot");
const DeliveryMethod = require("./models/DeliveryMethod");
const Delivery = require("./models/Delivery");
const auth = require("./../middleware/auth");
const Order = require("../orders/models/Order");
const { Types } = require("mongoose");
const { merge } = require("lodash");
const {
  getCourrierServices,
  createCourrierServices,
  updateCourrierServices,
  getCourrierServicesDetail,
} = require("./views/courrier");

const router = Router();

router.get("/modes", async (req, res) => {
  const deliveryMode = await Mode.find();
  return res.json({ results: deliveryMode });
});
router.get("/modes/:id", async (req, res) => {
  const deliveryMode = await Mode.findById(req.params.id);
  if (!deliveryMode) {
    return res.status(404).json({ detail: "Delivery Mode note found" });
  }
  return res.json(deliveryMode);
});
router.post("/modes", async (req, res) => {
  try {
    const value = await modeValidator(req.body);
    const deliveryMode = new Mode(value);
    await deliveryMode.save();
    return res.json(deliveryMode);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.put("/modes/:id", async (req, res) => {
  try {
    const mode = await Mode.findById(req.params.id);
    if (!mode) {
      throw {
        status: 404,
        message: "Mode Not found!",
      };
    }
    const value = await modeValidator(req.body);
    mode.name = value.name;
    await mode.save();
    return res.json(mode);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});

router.get("/timeslots", async (req, res) => {
  const timeSlotes = await TimeSlot.find();
  return res.json({ results: timeSlotes });
});

router.get("/timeslots/:id", async (req, res) => {
  const timeSlot = await TimeSlot.findById(req.params.id);
  if (!timeSlot) {
    return res.status(404).json({ detail: "Delivery TimeSlot  not found" });
  }
  return res.json(timeSlot);
});

router.post("/timeslots", async (req, res) => {
  try {
    const value = await timeSlotValidator(req.body);
    const timeSlote = new TimeSlot(value);
    await timeSlote.save();
    return res.json(timeSlote);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});

router.put("/timeslots/:id", async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      throw {
        status: 404,
        message: "Delivery TimeSlot Not found!",
      };
    }
    const value = await timeSlotValidator(req.body);
    timeSlot.label = value.label;
    timeSlot.startTime = value.startTime;
    timeSlot.endTime = value.endTime;
    timeSlot.capacity = value.capacity;
    await timeSlot.save();
    return res.json(timeSlot);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.get("/methods", async (req, res) => {
  const methods = await DeliveryMethod.find();
  return res.json({ results: methods });
});
router.get("/methods/:id", async (req, res) => {
  const method = await DeliveryMethod.findById(req.params.id);
  if (!method) {
    return res.status(404).json({ detail: "Delivery method  not found" });
  }
  return res.json(method);
});

router.post("/methods", async (req, res) => {
  try {
    const value = await deliveryMethodValidator(req.body);
    const method = new DeliveryMethod(value);
    await method.save();
    return res.json(method);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});

router.put("/methods/:id", async (req, res) => {
  try {
    const method = await DeliveryMethod.findById(req.params.id);
    if (!method) {
      throw {
        status: 404,
        message: "Delivery methods Not found!",
      };
    }
    const value = await deliveryMethodValidator(req.body);
    method.name = value.name;
    method.description = value.description;
    method.blockOnTimeSlotFull = value.blockOnTimeSlotFull;
    await method.save();
    return res.json(method);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});

router.get("/", async (req, res) => {
  const methods = await Delivery.find().populate(
    // "dispencedBy",
    // "deliveredBy",
    [
      "order",
      {
        path: "dispencedBy",
        model: "User",
      },
      {
        path: "deliveredBy",
        model: "User",
      },
    ]
  );
  return res.json({ results: methods });
});
router.get("/history", [auth], async (req, res) => {
  const methods = await Delivery.find({ deliveredBy: req.user._id }).populate(
    // "dispencedBy",
    // "deliveredBy",
    [
      {
        path: "order",
        model: "Order",
        select:
          "patient deliveryAddress deliveryTimeSlot deliveryMode phoneNumber",
      },
      {
        path: "deliveredBy",
        model: "User",
        select: "username email phoneNumber image",
      },
    ]
  );
  return res.json({ results: methods });
});
router.post("/", async (req, res) => {
  try {
    const value = await deliveryValidator(req.body);
    const delivery = new Delivery(value);
    await delivery.save();
    return res.json(delivery);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.put("/:id", async (req, res) => {
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
});
router.post("/:id/:action", async (req, res) => {
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
});

router.get("/courrier-services", getCourrierServices);
router.post("/courrier-services", createCourrierServices);
router.put("/courrier-services/:id", updateCourrierServices);
router.get("/courrier-services/:id", getCourrierServicesDetail);

router.get("/:id", async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate(
    // "dispencedBy",
    // "deliveredBy",
    [
      {
        path: "order",
        model: "Order",
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
});

module.exports = router;
