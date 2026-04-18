const { validatebody } = require("../../Middleware/Validatebody");
const {
  signupSchema,
  loginSchema,
  editUserSettingsSchema,
} = require("../../Schemas/allSchemas");

describe("validatebody Middleware", () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  function validate(schema, body) {
    const req = { body };
    validatebody(schema)(req, res, next);
  }

  // ─── signupSchema ─────────────────────────────────────────────────────────

  describe("signupSchema", () => {
    const valid = {
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "0501234567",
      email: "john@example.com",
      password: "secret123",
      repassword: "secret123",
    };

    it("passes a fully valid signup body", () => {
      validate(signupSchema, valid);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("rejects when firstName is missing", () => {
      const { firstName: _, ...body } = valid;
      validate(signupSchema, body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when email is missing", () => {
      const { email: _, ...body } = valid;
      validate(signupSchema, body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when password is shorter than 6 characters", () => {
      validate(signupSchema, { ...valid, password: "abc", repassword: "abc" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects additional properties (privilege escalation guard)", () => {
      validate(signupSchema, { ...valid, isAdmin: true });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when phoneNumber is an empty string", () => {
      validate(signupSchema, { ...valid, phoneNumber: "" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when firstName is an empty string", () => {
      validate(signupSchema, { ...valid, firstName: "" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("sends a plain string error message (not a raw AJV object)", () => {
      const { firstName: _, ...body } = valid;
      validate(signupSchema, body);
      expect(typeof res.send.mock.calls[0][0]).toBe("string");
    });
  });

  // ─── loginSchema ──────────────────────────────────────────────────────────

  describe("loginSchema", () => {
    const valid = {
      email: "john@example.com",
      password: "secret123",
    };

    it("passes a valid login body", () => {
      validate(loginSchema, valid);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("rejects when password is missing", () => {
      validate(loginSchema, { email: "john@example.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when email is missing", () => {
      validate(loginSchema, { password: "secret123" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when email is shorter than 6 characters", () => {
      validate(loginSchema, { email: "a@b.c", password: "secret123" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects additional properties (no privilege escalation)", () => {
      validate(loginSchema, { ...valid, isAdmin: true });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── editUserSettingsSchema ───────────────────────────────────────────────

  describe("editUserSettingsSchema", () => {
    const valid = {
      firstName: "Jane",
      lastName: "Doe",
      phoneNumber: "0501234567",
      email: "jane@example.com",
    };

    it("passes a valid edit-user body", () => {
      validate(editUserSettingsSchema, valid);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("passes when optional bio is included within 140 chars", () => {
      validate(editUserSettingsSchema, { ...valid, bio: "Hello world" });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("passes when bio is exactly 140 characters (boundary)", () => {
      validate(editUserSettingsSchema, { ...valid, bio: "x".repeat(140) });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("rejects when bio exceeds 140 characters", () => {
      validate(editUserSettingsSchema, { ...valid, bio: "x".repeat(141) });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when firstName is shorter than 2 characters", () => {
      validate(editUserSettingsSchema, { ...valid, firstName: "J" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when lastName is missing", () => {
      const { lastName: _, ...body } = valid;
      validate(editUserSettingsSchema, body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects when phoneNumber is shorter than 10 characters", () => {
      validate(editUserSettingsSchema, { ...valid, phoneNumber: "050123" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
