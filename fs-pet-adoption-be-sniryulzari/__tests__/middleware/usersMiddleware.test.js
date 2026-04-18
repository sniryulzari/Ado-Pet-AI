jest.mock("../../Models/usersModel", () => ({
  getUserByEmailModel: jest.fn(),
}));

const bcrypt = require("bcrypt");
const { getUserByEmailModel } = require("../../Models/usersModel");
const {
  passwordMatch,
  isNewUser,
  hashPassword,
  isExistingUser,
  verifyPassword,
} = require("../../Middleware/UsersMiddleware");

describe("UsersMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ─── passwordMatch ───────────────────────────────────────────────────────────

  describe("passwordMatch", () => {
    it("calls next() when password and repassword match", () => {
      req.body = { password: "secret123", repassword: "secret123" };
      passwordMatch(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 400 when passwords do not match", () => {
      req.body = { password: "secret123", repassword: "different" };
      passwordMatch(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Passwords do not match");
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when both passwords are empty but not equal (edge: undefined vs undefined passes)", () => {
      // both undefined → technically match → next() called
      req.body = {};
      passwordMatch(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // ─── isNewUser ───────────────────────────────────────────────────────────────

  describe("isNewUser", () => {
    it("calls next() when email is not already registered", async () => {
      getUserByEmailModel.mockResolvedValue(null);
      req.body.email = "new@example.com";
      await isNewUser(req, res, next);
      expect(getUserByEmailModel).toHaveBeenCalledWith("new@example.com");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when the email is already registered", async () => {
      getUserByEmailModel.mockResolvedValue({ email: "exists@example.com" });
      req.body.email = "exists@example.com";
      await isNewUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        "An account with this email already exists"
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── hashPassword ────────────────────────────────────────────────────────────

  describe("hashPassword", () => {
    it("hashes a valid password and calls next()", async () => {
      req.body.password = "mypassword";
      await new Promise((resolve) => {
        next.mockImplementation(resolve);
        hashPassword(req, res, next);
      });
      expect(req.body.password).not.toBe("mypassword");
      expect(req.body.password).toMatch(/^\$2b\$/);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("removes the password field and calls next() when password is empty string", () => {
      req.body.password = "";
      hashPassword(req, res, next);
      expect(req.body).not.toHaveProperty("password");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when password is shorter than 6 characters", () => {
      req.body.password = "abc";
      hashPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        "Password must be at least 6 characters"
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("accepts a password of exactly 6 characters", async () => {
      req.body.password = "abcdef";
      await new Promise((resolve) => {
        next.mockImplementation(resolve);
        hashPassword(req, res, next);
      });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ─── isExistingUser ──────────────────────────────────────────────────────────

  describe("isExistingUser", () => {
    it("attaches user to req.body and calls next() when user exists", async () => {
      const mockUser = { email: "user@example.com", password: "hash" };
      getUserByEmailModel.mockResolvedValue(mockUser);
      req.body.email = "user@example.com";
      await isExistingUser(req, res, next);
      expect(req.body.user).toBe(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns 400 with generic message when user does not exist (prevents email enumeration)", async () => {
      getUserByEmailModel.mockResolvedValue(null);
      req.body.email = "nobody@example.com";
      await isExistingUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid email or password");
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── verifyPassword ──────────────────────────────────────────────────────────

  describe("verifyPassword", () => {
    it("calls next() when the plaintext password matches the stored hash", async () => {
      const hash = await bcrypt.hash("correct-password", 10);
      req.body = { password: "correct-password", user: { password: hash } };
      await new Promise((resolve) => {
        next.mockImplementation(resolve);
        verifyPassword(req, res, next);
      });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns 400 with generic message when password is wrong (prevents email enumeration)", async () => {
      const hash = await bcrypt.hash("correct-password", 10);
      req.body = { password: "wrong-password", user: { password: hash } };
      await new Promise((resolve) => {
        res.send.mockImplementation(resolve);
        verifyPassword(req, res, next);
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid email or password");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
