// Create userSchema (AJV format)

module.exports = {
  type: "object",
  properties: {
    first_name: {
      type: "string",
      minLength: 2,
    },
    last_name: {
      type: ["string", "null"],
      minLength: 2,
    }, // lastname can define but not required
    email: {
      type: "string",
      format: "email",
    },
  },
  required: ["first_name", "email"], // Only for POST
  additionalProperties: true, // here we passes true, as we have id property while updating user
};
