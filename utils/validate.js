const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true }); // show all errors
require("ajv-formats")(ajv); // to support "format": "email"

function validateSchema(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: validate.errors || [],
  };
}

module.exports = validateSchema;
