const { Router } = require("express");
const {
  getArtModels,
  createARTModel,
  updateARTModel,
  getARTModelDetail,
} = require("./views/artModels");
const auth = require("../middleware/auth");
const {
  getARTCommunityLeads,
  createARTCommunityLead,
  updateARTCommunityLead,
  getARTCommunityLeadDetail,
} = require("./views/leads");
const {
  getARTDistributionEvents,
  createARTDistributionEvent,
  updateARTDistributionEvent,
  getARTDistributionEventDetail,
} = require("./views/events");

const router = Router();

router.get("/models", [auth], getArtModels);
router.post("/models", [auth], createARTModel);
router.put("/models/:id", [auth], updateARTModel);
router.get("/models/:id", [auth], getARTModelDetail);

router.get("/community-leads", [auth], getARTCommunityLeads);
router.post("/community-leads", [auth], createARTCommunityLead);
router.get("/community-leads/:id", [auth], getARTCommunityLeadDetail);
router.put("/community-leads/:id", [auth], updateARTCommunityLead);

router.get("/distribution-events", [auth], getARTDistributionEvents);
router.get("/distribution-events/:id", [auth], getARTDistributionEventDetail);
router.post("/distribution-events", [auth], createARTDistributionEvent);
router.put("/distribution-events/:id", [auth], updateARTDistributionEvent);

module.exports = router;
