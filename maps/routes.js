const { Router, json } = require("express");
const {
  mapQuestPlacesSearch,
  openRoutePlaceSearch,
  mapQuestReverseGeoCode,
  openRouteReverseGeocode,
  openRouteMatrix,
  mapQuestMatrix,
  mapQuestOptimizedRoute,
} = require("./api");

const router = Router();

router.get("/places", async (req, res) => {
  const results = await openRoutePlaceSearch(req.query.q);
  res.json({ results: results || [] });
});
router.get("/direction", async (req, res) => {});
router.get("/geocoding/reverse", async (req, res) => {
  const location = req.query.location;
  if (!location || location.split(",").length !== 2) {
    return res.status(400).json({ detail: "Invalid Query parameter location" });
  }
  const [lat, lng] = location.split(",");
  const results = await openRouteReverseGeocode({ lat, lng });
  res.json({ results: results || [] });
});
router.post("/matrix", async (req, res) => {
  const profile = req.body.profile || undefined;
  const response = await mapQuestMatrix({ ...req.body, profile });
  return res.json(response);
});
router.post("/direction", async (req, res) => {
  const profile = req.body.profile || undefined;
  const response = await mapQuestOptimizedRoute({ ...req.body, profile });
  return res.json(response);
});

module.exports = router;
