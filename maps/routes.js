const { Router } = require("express");
const { mapQuestPlacesSearch, openRoutePlaceSearch } = require("./api");

const router = Router();

router.get("/places", async (req, res) => {
  const results = await openRoutePlaceSearch(req.query.q);
  res.json({ results: results || [] });
});
router.get("/direction", async () => {});

module.exports = router;
