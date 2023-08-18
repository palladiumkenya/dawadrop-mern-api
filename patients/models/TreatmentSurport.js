const { model, Schema } = require("mongoose");

const TreatmentSurport = model(
  "TreatmentSurport",
  new Schema({
    careGiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    careReceiver: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    canPickUpDrugs: {
      type: Boolean,
      default: false,
    },
    canOrderDrug: {
      type: Boolean,
      default: false,
    },
  })
);

module.exports = TreatmentSurport;
