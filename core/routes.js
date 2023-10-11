const { Router } = require("express");
const {
  getSmsConfigs,
  updateSmsConfig,
  deleteSmsConfig,
  createSmsConfig,
} = require("./views/sms");

const router = Router();

router.get("/sms-config", getSmsConfigs);
router.put("/sms-config/:id", updateSmsConfig);
router.delete("/sms-config/:id", deleteSmsConfig);
router.post("/sms-config", createSmsConfig);

module.exports = router;
