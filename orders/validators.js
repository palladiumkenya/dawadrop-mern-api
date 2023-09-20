const Joi = require("joi");
const { cleanFalsyAttributes } = require("../utils/helpers");
const DeliveryMethod = require("../deliveries/models/DeliveryMethod");
const { Types } = require("mongoose");

const orderSchema = Joi.object({
  patient: Joi.string().required().label("Patient").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  appointment: Joi.string().required().label("Appointment"),
  deliveryAddress: Joi.object({
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Delivery address")
    .required(),
  deliveryTimeSlot: Joi.object({
    startTime: Joi.date().required().label("Start time"),
    endTime: Joi.date().required().label("End time"),
  })
    .label("Time between")
    .required(),
  deliveryMode: Joi.string()
    .required()
    .label("Delivery mode")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{9,14}$/)
    .label("Phone number")
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),
  drug: Joi.string().label("Drug").required(),
  careGiver: Joi.string().label("Care giver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
});
const dispenseDrugSchema = Joi.object({
  order: Joi.string()
    .required()
    .label("DeliveryServiceRequest")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  nextAppointmentDate: Joi.date().label("Next appointment date").required(),
});

const patientOrderSchema = Joi.object({
  deliveryAddress: Joi.object({
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Delivery address")
    .required(),
  deliveryTimeSlot: Joi.string()
    .label("Delivery Time slot")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  deliveryMode: Joi.string()
    .required()
    .label("Delivery mode")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  phoneNumber: Joi.string().max(14).min(9).label("Phone number"),
  deliveryMethod: Joi.string()
    .label("Delivery method")
    .required()
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  careGiver: Joi.string().label("Care giver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  careReceiver: Joi.string().label("Care giver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
});
const deliveryServiceRequestSchema = Joi.object({
  deliveryAddress: Joi.object({
    latitude: Joi.number().label("Latitude"),
    longitude: Joi.number().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Delivery address")
    .required(),
  phoneNumber: Joi.string().max(14).min(9).label("Phone number").required(),
  deliveryPerson: Joi.object({
    fullName: Joi.string().required().label("Full name"),
    nationalId: Joi.number().required().label("National Id"),
    phoneNumber: Joi.string().required().label("Phone number"),
    pickUpTime: Joi.date().required().label("Pick up time"),
  }).label("Delivery person"),
  deliveryMethod: Joi.string()
    .required()
    .label("Delivery Method")
    .valid("in-parcel", "in-person"),
  courrierService: Joi.string()
    .label("Courrier service")
    .hex()
    .length(24)
    .messages({
      "string.base": "{{#label}} invalid",
      "string.hex": "{{#label}} invalid",
      "string.length": "{{#label}} invalid",
    }),
  event: Joi.string().label("Event").hex().length(24).messages({
    "any.required": "You must specify how you want your drug delivered to you",
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
  appointment: Joi.string().label("Appointment"),
  type: Joi.valid("self", "other").default("self"),
  careReceiver: Joi.string().label("Care receiver").hex().length(24).messages({
    "string.base": "{{#label}} invalid",
    "string.hex": "{{#label}} invalid",
    "string.length": "{{#label}} invalid",
  }),
});

exports.orderValidator = async (data) => {
  return await orderSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.patientOrderValidator = async (data) => {
  return await patientOrderSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.dispenseDrugValidator = async (data) => {
  return await dispenseDrugSchema.validateAsync(cleanFalsyAttributes(data), {
    abortEarly: false,
  });
};
exports.deliveryServiceRequestValidator = async (data) => {
  return await deliveryServiceRequestSchema.validateAsync(
    cleanFalsyAttributes(data),
    {
      abortEarly: false,
    }
  );
};
