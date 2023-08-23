const { model, Schema } = require("mongoose");
const ARTDistributionModel = require("../../art/models/ARTDistributionModel");

const Patient = model(
  "Patient",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      cccNumber: {
        type: String,
        required: true,
        unique: true,
      },
      upiNumber: {
        type: String,
      },
      nationalId: {
        type: Number,
        required: true,
        unique: true,
      },
      firstName: {
        type: String,
        maxlength: 20,
      },
      lastName: {
        type: String,
        maxlength: 20,
      },
      surName: {
        type: String,
        maxlength: 20,
      },
      gender: {
        type: String,
        enum: ["F", "M", "U"],
      },
      phoneNumber: {
        type: String,
        maxlength: 14,
        minlength: 9,
      },
      primaryClinic: {
        type: Number,
      },
      artModel: {
        type: ARTDistributionModel.schema,
      },
      stable: {
        type: Boolean,
        default: false,
      },
    },
    {
      statics: {
        async getOrCreatePatientFromRemote(remotePatient) {
          const {
            clinic_number: cccNumber,
            f_name: firstName,
            m_name: lastName,
            l_name: surName,
            phone_no: phoneNumber,
            national_id: nationalId,
            upi_no: upiNumber,
            mfl_code: primaryClinic,
          } = remotePatient;
          let patient = await this.findOne({ cccNumber });
          if (!patient) {
            patient = new this({
              cccNumber,
              firstName,
              lastName,
              surName,
              phoneNumber,
              nationalId,
              upiNumber,
              primaryClinic,
            });
            await patient.save();
          }
          return patient;
        },
      },
      virtuals: {
        created: {
          get: function () {
            const timestamp = this._id.getTimestamp();
            return timestamp;
          },
        },
      },
      // Options for virtual properties
      toJSON: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to JSON
      toObject: { virtuals: true, getters: true }, // Include virtual properties and getters when converting to object
    }
  )
);
module.exports = Patient;
