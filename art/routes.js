const { Router } = require("express");
const {
  getArtModels,
  createARTModel,
  updateARTModel,
  getARTModelDetail,
} = require("./views/artModels");
const auth = require("../middleware/auth");

const router = Router();

router.get("/models", [auth], getArtModels);
router.post("/models", [auth], createARTModel);
router.put("/models/:id", [auth], updateARTModel);
router.get("/models/:id", [auth], getARTModelDetail);

module.exports = router;
