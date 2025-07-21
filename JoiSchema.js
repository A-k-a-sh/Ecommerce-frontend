const Joi = require('joi');

const JoiListingSchema = Joi.object({
    product_name: Joi.string().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null), //it could be empty or have null bc in db we set a default value
    price: Joi.number().required().min(0),
    features: Joi.string().required(),
})

const JoiReviewSchema = Joi.object({
    comment : Joi.string().required(),
    rating : Joi.number().required().min(1).max(5)
}).required()




const JoiPaymentSchema = Joi.object({
    customer_name : Joi.string().required(),
    phone : Joi.string().required(),
    address : Joi.string().required(),
    city : Joi.string().required(),
    email : Joi.string(),
    totalAmount : Joi.number().required()
})

module.exports =  {JoiListingSchema , JoiReviewSchema , JoiPaymentSchema}; ;