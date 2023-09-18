const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");

const artModelSchema = Joi.object({
  name: Joi.string().required().label("Model Name"),
  description: Joi.string().label("Model Description"),
  modelCode: Joi.string().required().label("Model code"),
});
const leadSchema = Joi.object({
  user: Joi.string().required().label("User").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  artModel: Joi.string()
    .label("ART Community")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
});
const eventSchema = Joi.object({
  title: Joi.string().required().label("Event Title"),
  group: Joi.string()
    .label("ART Distribtion Group")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  distributionTime: Joi.date()
    .min("now")
    .iso()
    .label("Distribution time")
    .required(),
  distributionLocation: Joi.object({
    latitude: Joi.number().label("Latitude"),
    longitude: Joi.number().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Distribution Location")
    .required(),
  remarks: Joi.string().label("Remarks"),
  remiderNortificationDates: Joi.array()
    .items(Joi.date().min("now").iso())
    .label("Reminder dates")
    .default([]),
});
const groupSchema = Joi.object({
  title: Joi.string().required().label("Art Group Name"),
  extraSubscribers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().label("Name"),
        cccNumber: Joi.string().required().label("Patient CCC Number"),
        phoneNumber: Joi.string()
          .max(14)
          .min(9)
          .label("Phone number")
          .required(),
      })
    )
    .default([])
    .label("Extra esubscribers"),
  description: Joi.string().label("Group Description"),
});
const groupMemberShipSchema = Joi.object({
  paticipant: Joi.string()
    .required()
    .label("Paticipant")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
});

const initiateDeliverySchema = Joi.object({
  member: Joi.string().label("Member").required().hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  services: Joi.array().items(Joi.string()).label("Extra services").default([]),
  deliveryType: Joi.string()
    .label("Delivery type")
    .valid("self", "courrier", "delegate", "patient-preferred")
    .required(),
  courrierService: Joi.string()
    .label("Courrier service")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  deliveryPerson: Joi.object({
    fullName: Joi.string().required().label("Full name"),
    nationalId: Joi.number().required().label("National Id"),
    phoneNumber: Joi.string().required().label("Phone number"),
    pickUpTime: Joi.date().required().label("Pick up time"),
  }).label("Delivery person"),
  deliveryAddress: Joi.object({
    latitude: Joi.number().label("Latitude"),
    longitude: Joi.number().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Delivery address")
    .required(),
});

module.exports.artModelValidator = async (data) => {
  return await artModelSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.leadsValidator = async (data) => {
  return await leadSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.eventsValidator = async (data) => {
  return await eventSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.groupsValidator = async (data) => {
  return await groupSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.groupsMemberShipValidator = async (data) => {
  return await groupMemberShipSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
module.exports.initiateDeliveryValidator = async (data) => {
  return await initiateDeliverySchema.validateAsync(
    cleanFalsyAttributes(data),
    {
      abortEarly: false,
    }
  );
};
