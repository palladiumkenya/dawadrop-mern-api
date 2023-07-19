const { Router } = require("express");
const { getPatientAppointments } = require("./api");

const router = Router();

router.get("/", async (req, resp) => {
  const q = req.query;
  const cccNumber = q.patient;
  const appointments = await getPatientAppointments(cccNumber);
  console.log("Heare");
  resp.json({ results: appointments ? appointments : [] });
});
module.exports = router;
