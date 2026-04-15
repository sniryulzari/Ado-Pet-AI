const Ajv = require("ajv");
const ajv = new Ajv();

function validatebody(schema) {
  return (req, res, next) => {
    const valid = ajv.validate(schema, req.body);
    if (!valid) {
      // Send a plain string — never the raw AJV error object, which leaks schema structure
      const msg = ajv.errors[0]?.message ?? "Invalid request body";
      res.status(400).send(msg);
      return;
    }
    next(); 
  };
}

module.exports = { validatebody }
