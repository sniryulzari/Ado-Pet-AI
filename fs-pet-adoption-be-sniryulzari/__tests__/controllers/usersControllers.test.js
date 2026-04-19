// Mock all external dependencies before any require() calls
jest.mock("../../Models/usersModel");
jest.mock("../../utils/emailService", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendAdoptionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../Schemas/petsSchemas", () => ({ findById: jest.fn() }));
jest.mock("../../Schemas/userSchemas", () => ({ findById: jest.fn() }));

const usersModel = require("../../Models/usersModel");
const { sendPasswordResetEmail } = require("../../utils/emailService");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  savePet,
  deleteSavedPet,
  returnPet,
  getMyPets,
} = require("../../Controllers/usersControllers");

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
}

describe("usersControllers", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, cookies: {} };
    res = makeRes();
    jest.clearAllMocks();
  });

  // ─── signup ───────────────────────────────────────────────────────────────

  describe("signup", () => {
    it("returns 201 with safe user fields (no password) on success", async () => {
      const savedUser = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: "hashed-secret", // should NOT appear in response
      };
      usersModel.signupModel.mockResolvedValue(savedUser);
      req.body = {
        email: "test@example.com",
        password: "hashed",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "0501234567",
      };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      });
      // Password must never be sent back to the client
      expect(res.send.mock.calls[0][0]).not.toHaveProperty("password");
    });

    it("returns 500 when the model throws", async () => {
      usersModel.signupModel.mockRejectedValue(new Error("DB write failed"));
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("sets an httpOnly cookie and returns user info", () => {
      req.body.user = { _id: "user123", firstName: "Test", lastName: "User" };
      login(req, res);
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        expect.any(String),
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.send).toHaveBeenCalledWith({
        id: "user123",
        firstName: "Test",
        lastName: "User",
      });
    });

    it("does not include the JWT token in the response body", () => {
      req.body.user = { _id: "user123", firstName: "Test", lastName: "User" };
      login(req, res);
      const body = res.send.mock.calls[0][0];
      expect(body).not.toHaveProperty("token");
    });

    it("uses sameSite:lax and secure:false in test/non-production env", () => {
      req.body.user = { _id: "user123", firstName: "Test", lastName: "User" };
      process.env.NODE_ENV = "test";
      login(req, res);
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        expect.any(String),
        expect.objectContaining({ sameSite: "lax", secure: false })
      );
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("clears the token cookie and returns { ok: true }", () => {
      logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith(
        "token",
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────

  describe("forgotPassword", () => {
    const GENERIC =
      "If this email is registered, you will receive a reset link shortly.";

    it("returns 400 when email is not provided", async () => {
      req.body = {};
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Email is required");
    });

    it("returns generic message for an unregistered email (prevents enumeration)", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      req.body.email = "nobody@example.com";
      await forgotPassword(req, res);
      // Must NOT reveal that the email is not registered
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ message: GENERIC });
    });

    it("saves a reset token and sends the password-reset email for a registered user", async () => {
      usersModel.getUserByEmailModel.mockResolvedValue({
        _id: "user123",
        email: "user@example.com",
      });
      usersModel.saveResetTokenModel.mockResolvedValue(undefined);
      req.body.email = "user@example.com";

      await forgotPassword(req, res);

      expect(usersModel.saveResetTokenModel).toHaveBeenCalledWith(
        "user123",
        expect.any(String), // 64-char hex token
        expect.any(Date)    // expiry date 1 hour from now
      );
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.stringContaining("reset-password")
      );
      expect(res.send).toHaveBeenCalledWith({ message: GENERIC });
    });

    it("returns the same generic message whether the user exists or not", async () => {
      // When user exists
      usersModel.getUserByEmailModel.mockResolvedValue({
        _id: "u1",
        email: "x@y.com",
      });
      usersModel.saveResetTokenModel.mockResolvedValue(undefined);
      req.body.email = "x@y.com";
      await forgotPassword(req, res);
      const msg1 = res.send.mock.calls[0][0];

      res = makeRes();
      // When user does not exist
      usersModel.getUserByEmailModel.mockResolvedValue(null);
      req.body.email = "nobody@example.com";
      await forgotPassword(req, res);
      const msg2 = res.send.mock.calls[0][0];

      expect(msg1).toEqual(msg2);
    });
  });

  // ─── resetPassword ────────────────────────────────────────────────────────

  describe("resetPassword", () => {
    it("returns 400 when both token and password are missing", async () => {
      req.body = {};
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Token and password are required");
    });

    it("returns 400 when token is present but password is missing", async () => {
      req.body = { token: "tok" };
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when password is shorter than 6 characters", async () => {
      req.body = { token: "valid-token", password: "abc" };
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        "Password must be at least 6 characters"
      );
    });

    it("returns 400 when the reset token is invalid or expired", async () => {
      usersModel.getUserByResetTokenModel.mockResolvedValue(null);
      req.body = { token: "bad-token", password: "newpassword" };
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid or expired reset link");
    });

    it("hashes the new password and returns { ok: true } for a valid token", async () => {
      usersModel.getUserByResetTokenModel.mockResolvedValue({ _id: "user123" });
      usersModel.resetPasswordModel.mockResolvedValue(undefined);
      req.body = { token: "valid-token", password: "newpassword" };
      await resetPassword(req, res);
      expect(usersModel.resetPasswordModel).toHaveBeenCalledWith(
        "user123",
        expect.stringMatching(/^\$2b\$/) // bcrypt hash
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("never stores the plaintext password in the database", async () => {
      usersModel.getUserByResetTokenModel.mockResolvedValue({ _id: "user123" });
      usersModel.resetPasswordModel.mockResolvedValue(undefined);
      req.body = { token: "valid-token", password: "plaintextpassword" };
      await resetPassword(req, res);
      const storedHash = usersModel.resetPasswordModel.mock.calls[0][1];
      expect(storedHash).not.toBe("plaintextpassword");
    });
  });

  // ─── savePet / deleteSavedPet / returnPet ─────────────────────────────────

  describe("savePet", () => {
    it("returns { ok: true } on success", async () => {
      usersModel.savePetModel.mockResolvedValue(undefined);
      req.params = { petId: "pet123" };
      req.userId = "user123";
      await savePet(req, res);
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 when the model throws", async () => {
      usersModel.savePetModel.mockRejectedValue(new Error("DB error"));
      req.params = { petId: "pet123" };
      req.userId = "user123";
      await savePet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteSavedPet", () => {
    it("returns { ok: true } on success", async () => {
      usersModel.deleteSavePetModel.mockResolvedValue(undefined);
      req.params = { petId: "pet123" };
      req.userId = "user123";
      await deleteSavedPet(req, res);
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });
  });

  describe("returnPet", () => {
    it("returns userId in response on success", async () => {
      usersModel.returnPetModel.mockResolvedValue(undefined);
      req.params = { petId: "pet123" };
      req.userId = "user123";
      await returnPet(req, res);
      expect(res.send).toHaveBeenCalledWith({ userId: "user123" });
    });
  });

  // ─── getMyPets ────────────────────────────────────────────────────────────

  describe("getMyPets", () => {
    it("returns the user document from the model", async () => {
      const mockUser = { _id: "user123", adoptPet: ["pet1"], fosterPet: [] };
      usersModel.myPetsModel.mockResolvedValue(mockUser);
      req.userId = "user123";
      await getMyPets(req, res);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it("returns 500 on model error", async () => {
      usersModel.myPetsModel.mockRejectedValue(new Error("DB error"));
      req.userId = "user123";
      await getMyPets(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
