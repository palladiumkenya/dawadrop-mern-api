const { Router } = require("express");
const Mode = require("./models/Mode");
const { modeValidator } = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");

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

module.exports = router;
