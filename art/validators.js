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

const createDeliverySchema = async (event) => {
  const bing = Joi.object({
    order: Joi.string().label("Order").hex().length(24).messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
    event: Joi.string().label("Distribution Event").hex().length(24).messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
    member: Joi.string()
      .label("Member")
      .hex()
      .length(24)
      .messages({
        "string.base": "{{#label}} invalid",
        "string.hex": "{{#label}} invalid",
        "string.length": "{{#label}} invalid",
      })
      .when("event", {
        is: Joi.exist(),
        then: Joi.string().required(),
        otherwise: Joi.string(),
      }),
    services: Joi.array().default([]).label("Extra services"),
    deliveryType: Joi.string()
      .label("Delivery type")
      .valid("self", "courrier", "delegate")
      .required()
      .when("member", {
        is: Joi.exist(),
        then: Joi.valid(" ", "courrier", "delegate", "patient-preferred"),
        otherwise: Joi.valid("self", "courrier", "delegate"),
      }),
    courrierService: Joi.string()
      .label("Courrier service")
      .when("deliveryType", {
        is: "courrier",
        then: Joi.string().required(),
        otherwise: Joi.string(),
      }),
    deliveryPerson: Joi.object({
      fullName: Joi.string().required().label("Full name"),
      nationalId: Joi.number().required().label("National Id"),
      phoneNumber: Joi.string().label("Phone number").required(),
      pickUpTime: Joi.date().required().label("Pick up time"),
    })
      .label("Delivery person")
      .when("deliveryType", {
        is: ["courrier", "delegate"],
        then: Joi.object({
          fullName: Joi.string().required().label("Full name"),
          nationalId: Joi.number().required().label("National Id"),
          phoneNumber: Joi.string().label("Phone number").required(),
          pickUpTime: Joi.date().required().label("Pick up time"),
        }).required(),
        otherwise: Joi.object({
          fullName: Joi.string().required().label("Full name"),
          nationalId: Joi.number().required().label("National Id"),
          phoneNumber: Joi.string().label("Phone number").required(),
          pickUpTime: Joi.date().required().label("Pick up time"),
        }),
      }),
    deliveryAddress: Joi.object({
      latitude: Joi.number().label("Latitude"),
      longitude: Joi.number().label("Longitude"),
      address: Joi.string().label("Address"),
    })
      .label("Delivery address")
      .required(),
  }).xor("order", "event");
  return bing;
};

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
  return await (
    await createDeliverySchema()
  ).validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
