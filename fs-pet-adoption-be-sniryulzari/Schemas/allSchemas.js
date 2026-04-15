const signupSchema = {
  type: "object",
  properties: {
    firstName:   { type: "string", minLength: 1 },
    lastName:    { type: "string", minLength: 1 },
    phoneNumber: { type: "string", minLength: 1 },
    email:       { type: "string", minLength: 1 },
    password:    { type: "string", minLength: 6 },
    repassword:  { type: "string" },
  },
  required: ["firstName", "lastName", "phoneNumber", "email", "password", "repassword"],
  additionalProperties: false,
};

const loginSchema = {
  type: "object",
  properties: {
    email:    { type: "string", minLength: 6 },
    password: { type: "string", minLength: 6 },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

const editUserSettingsSchema = {
  type: "object",
  properties: {
    firstName:   { type: "string", minLength: 2 },
    lastName:    { type: "string", minLength: 2 },
    phoneNumber: { type: "string", minLength: 10 },
    email:       { type: "string", minLength: 10 },
    bio:         { type: "string", maxLength: 140 },
  },
  // password is intentionally absent here — it is optional (blank = keep current)
  // and validated by hashPassword middleware instead.
  required: ["firstName", "lastName", "phoneNumber", "email"],
  // No additionalProperties: false — Auth middleware injects userId into req.body
  // before this validator runs; adding it here would cause every request to fail.
  // Field whitelisting is enforced in the controller instead.
};

module.exports = { signupSchema, loginSchema, editUserSettingsSchema };
