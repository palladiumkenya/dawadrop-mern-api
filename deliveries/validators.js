const Joi = require("joi");

const modeSchema = Joi.object({
  name: Joi.string().required().label("Delivery Mode"),
});



exports.modeValidator = async(data)=>{
    return modeSchema.validateAsync(data, {abortEarly: false})
}