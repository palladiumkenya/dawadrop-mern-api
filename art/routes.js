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
const {
  getARTDistributionGroups,
  getARTDistributionGruopDetail,
  createARTDistributionGroup,
  updateARTDistributionGroup,
} = require("./views/groups");

const router = Router();

router.get("/models", [auth], getArtModels);
router.post("/models", [auth], createARTModel);
router.put("/models/:id", [auth], updateARTModel);
router.get("/models/:id", [auth], getARTModelDetail);

router.get("/group-leads", [auth], getARTCommunityLeads);
router.post("/group-leads", [auth], createARTCommunityLead);
router.get("/group-leads/:id", [auth], getARTCommunityLeadDetail);
router.put("/group-leads/:id", [auth], updateARTCommunityLead);

router.get("/distribution-events", [auth], getARTDistributionEvents);
router.post("/distribution-events", [auth], createARTDistributionEvent);
router.get("/distribution-events/:id", [auth], getARTDistributionEventDetail);
router.put("/distribution-events/:id", [auth], updateARTDistributionEvent);

router.get("/distribution-groups", [auth], getARTDistributionGroups);
router.get("/distribution-groups/:id", [auth], getARTDistributionGruopDetail);
router.post("/distribution-groups", [auth], createARTDistributionGroup);
router.put("/distribution-groups/:id", [auth], updateARTDistributionGroup);

module.exports = router;
