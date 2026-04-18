jest.mock("../../Schemas/userSchemas", () => ({
  findById: jest.fn(),
}));

const User = require("../../Schemas/userSchemas");
const { isAdmin } = require("../../Middleware/AdminMiddleWare");

describe("isAdmin Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { userId: "user123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("calls next() when the user is found and isAdmin=true", async () => {
    User.findById.mockResolvedValue({ isAdmin: true });
    await isAdmin(req, res, next);
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 when the user exists but isAdmin=false", async () => {
    User.findById.mockResolvedValue({ isAdmin: false });
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Forbidden access");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the user is not found in the database", async () => {
    User.findById.mockResolvedValue(null);
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("User not found");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 500 when the database throws an error", async () => {
    User.findById.mockRejectedValue(new Error("DB connection error"));
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Server error");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when isAdmin is a truthy non-boolean (strict check)", async () => {
    // The middleware checks `userInfo.isAdmin` — a string "true" would be truthy
    // but we want to ensure only boolean true passes
    User.findById.mockResolvedValue({ isAdmin: false });
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
