const { Router } = require("express");
const {
  getSmsConfigs,
  updateSmsConfig,
  deleteSmsConfig,
  createSmsConfig,
} = require("./views/sms");

const router = Router();

router.get("/", getSmsConfigs);
router.put("/:id", updateSmsConfig);
router.delete("/:id", deleteSmsConfig);
router.post("/", createSmsConfig);

module.exports = router;
