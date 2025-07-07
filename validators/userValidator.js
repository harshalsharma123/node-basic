const Joi = require("joi");

const userSchema = Joi.object({
  first_name: Joi.string().min(2).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().allow("", null), // optional
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});

module.exports = userSchema;
