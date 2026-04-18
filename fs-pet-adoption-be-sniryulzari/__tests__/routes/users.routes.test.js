/**
 * Integration tests for /users routes.
 *
 * These tests import the real Express app (app.js) and exercise the full
 * middleware chain — AJV validation → custom middleware → controller — via
 * supertest HTTP requests.  Only DB models and external email/cloud services
 * are mocked so no live infrastructure is needed.
 */

// ─── Mock all external dependencies loaded transitively by app.js ────────────

// Disable rate limiting — the limiter is stateful and accumulates across tests,
// causing legitimate test requests to be rejected with 429 after a few hits.
jest.mock("express-rate-limit", () => () => (_req, _res, next) => next());

jest.mock("../../Models/usersModel");
jest.mock("../../Models/petsModel");
jest.mock("../../Models/adminModel");
jest.mock("../../Models/newsletterModel");
jest.mock("../../Models/appOperationsModel", () => ({
  petOfTheWeekModel: jest.fn(),
}));

jest.mock("../../utils/emailService", () => ({
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(undefined),
  sendAdoptionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

// Prevent actual Cloudinary calls; multer still works (no file sent in tests)
jest.mock("cloudinary", () => ({
  v2: {
    config:   jest.fn(),
    uploader: { upload: jest.fn() },
  },
}));

// Prevent SibApiV3Sdk from making network calls
jest.mock("sib-api-v3-sdk", () => ({
  ApiClient:               { instance: { authentications: { "api-key": {} } } },
  TransactionalEmailsApi:  jest.fn(() => ({ sendTransacEmail: jest.fn().mockResolvedValue({}) })),
  SendSmtpEmail:           jest.fn(() => ({})),
}));

jest.mock("../../Schemas/userSchemas", () => ({
  findById: jest.fn(),
}));
jest.mock("../../Schemas/petsSchemas", () => ({
  findById: jest.fn(),
}));

// ─── Imports (after mocks are registered) ────────────────────────────────────

const request     = require("supertest");
const bcrypt      = require("bcrypt");
const jwt         = require("jsonwebtoken");
const usersModel  = require("../../Models/usersModel");
const app         = require("../../app");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SECRET = process.env.TOKEN_SECRET;

function makeToken(id = "user123") {
  return jwt.sign({ id }, SECRET, { expiresIn: "1h" });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Users Routes – Integration", () => {
  beforeEach(() => jest.resetAllMocks());

  // ── Health check (sanity gate) ───────────────────────────────────────────

  describe("GET /health", () => {
    it("returns 200", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
    });
  });

  // ── POST /users/signup ───────────────────────────────────────────────────

  describe("POST /users/signup", () => {
    const validBody = {
      firstName:   "John",
      lastName:    "Doe",
      phoneNumber: "0501234567",
      email:       "john@example.com",
      password:    "secret123",
      repassword:  "secret123",
    };

    it("returns 201 with safe user fields on success", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      usersModel.signupModel.mockResolvedValue({
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
      });
      const res = await request(app).post("/users/signup").send(validBody);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ email: "john@example.com", firstName: "John" });
    });

    it("never returns the password hash in the response body", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      usersModel.signupModel.mockResolvedValue({
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "$2b$10$hashedpassword",
      });
      const res = await request(app).post("/users/signup").send(validBody);
      expect(res.body).not.toHaveProperty("password");
    });

    it("returns 400 (AJV) when required fields are missing", async () => {
      const res = await request(app).post("/users/signup").send({ email: "x@y.com" });
      expect(res.status).toBe(400);
    });

    it("returns 400 (AJV) when password is shorter than 6 chars", async () => {
      const res = await request(app).post("/users/signup").send({
        ...validBody,
        password: "abc",
        repassword: "abc",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 (AJV) when extra fields are sent (privilege escalation guard)", async () => {
      const res = await request(app).post("/users/signup").send({
        ...validBody,
        isAdmin: true,
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 (passwordMatch) when passwords do not match", async () => {
      const res = await request(app).post("/users/signup").send({
        ...validBody,
        repassword: "different",
      });
      expect(res.status).toBe(400);
      expect(res.text).toBe("Passwords do not match");
    });

    it("returns 400 (isNewUser) when email is already registered", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue({ email: "john@example.com" });
      const res = await request(app).post("/users/signup").send(validBody);
      expect(res.status).toBe(400);
      expect(res.text).toContain("email already exists");
    });
  });

  // ── POST /users/login ────────────────────────────────────────────────────

  describe("POST /users/login", () => {
    it("sets an httpOnly cookie and returns user info on success", async () => {
      const hash = await bcrypt.hash("secret123", 10);
      usersModel.getUserByEmailModel.mockResolvedValue({
        _id:       "user123",
        email:     "john@example.com",
        password:  hash,
        firstName: "John",
        lastName:  "Doe",
      });
      const res = await request(app)
        .post("/users/login")
        .send({ email: "john@example.com", password: "secret123" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: "user123", firstName: "John" });
      // Cookie must be present and httpOnly
      const cookies = res.headers["set-cookie"] ?? [];
      expect(cookies.some((c) => c.includes("token=") && c.includes("HttpOnly"))).toBe(true);
    });

    it("does not include the JWT in the response body", async () => {
      const hash = await bcrypt.hash("secret123", 10);
      usersModel.getUserByEmailModel.mockResolvedValue({
        _id: "u1",
        email: "j@e.com",
        password: hash,
        firstName: "J",
        lastName: "D",
      });
      const res = await request(app)
        .post("/users/login")
        .send({ email: "j@e.com", password: "secret123" });
      expect(res.body).not.toHaveProperty("token");
    });

    it("returns 400 with generic message for unknown email (prevents enumeration)", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      const res = await request(app)
        .post("/users/login")
        .send({ email: "nobody@example.com", password: "secret123" });
      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid email or password");
    });

    it("returns the same 400 message for a wrong password", async () => {
      const hash = await bcrypt.hash("correct", 10);
      usersModel.getUserByEmailModel.mockResolvedValue({
        _id: "u1",
        email: "john@example.com",
        password: hash,
      });
      const res = await request(app)
        .post("/users/login")
        .send({ email: "john@example.com", password: "wrongpw" }); // 7 chars — passes AJV minLength(6)
      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid email or password");
    });

    it("returns 400 (AJV) when body is empty", async () => {
      const res = await request(app).post("/users/login").send({});
      expect(res.status).toBe(400);
    });
  });

  // ── POST /users/logout ───────────────────────────────────────────────────

  describe("POST /users/logout", () => {
    it("clears the cookie and returns { ok: true }", async () => {
      const res = await request(app).post("/users/logout");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  // ── Auth middleware enforcement ──────────────────────────────────────────

  describe("Auth middleware on protected routes", () => {
    it("GET /users/userInfo returns 401 with no cookie", async () => {
      const res = await request(app).get("/users/userInfo");
      expect(res.status).toBe(401);
      expect(res.text).toBe("Token Required");
    });

    it("GET /users/userInfo returns 401 for a malformed token", async () => {
      const res = await request(app)
        .get("/users/userInfo")
        .set("Cookie", "token=not-a-real-jwt");
      expect(res.status).toBe(401);
      expect(res.text).toBe("Invalid Token");
    });

    it("GET /users/userInfo returns 200 for a valid token", async () => {
      const token    = makeToken("user123");
      const mockUser = {
        _id: "user123",
        firstName: "Test",
        toObject: () => ({ _id: "user123", firstName: "Test", password: "hash" }),
      };
      usersModel.getUserInfoByIdModel.mockResolvedValue(mockUser);
      const res = await request(app)
        .get("/users/userInfo")
        .set("Cookie", `token=${token}`);
      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty("password");
    });

    it("GET /users/mypets returns 401 without auth", async () => {
      const res = await request(app).get("/users/mypets");
      expect(res.status).toBe(401);
    });

    it("GET /users/savedPets returns 401 without auth", async () => {
      const res = await request(app).get("/users/savedPets");
      expect(res.status).toBe(401);
    });
  });

  // ── POST /users/forgot-password ──────────────────────────────────────────

  describe("POST /users/forgot-password", () => {
    const GENERIC = "If this email is registered, you will receive a reset link shortly.";

    it("returns 200 with generic message for an unregistered email", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      const res = await request(app)
        .post("/users/forgot-password")
        .send({ email: "nobody@example.com" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(GENERIC);
    });

    it("returns the same 200 generic message for a registered email", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue({ _id: "u1", email: "user@example.com" });
      usersModel.saveResetTokenModel.mockResolvedValue(undefined);
      const { sendPasswordResetEmail } = require("../../utils/emailService");
      sendPasswordResetEmail.mockResolvedValue(undefined);

      const res = await request(app)
        .post("/users/forgot-password")
        .send({ email: "user@example.com" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(GENERIC);
    });
  });
});
