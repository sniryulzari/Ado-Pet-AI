const jwt = require("jsonwebtoken");
const { Auth } = require("../../Middleware/AuthMiddleWare");

const SECRET = process.env.TOKEN_SECRET;

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it("returns 401 when no token cookie is present", async () => {
    await Auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Token Required");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed token string", async () => {
    req.cookies.token = "this-is-not-a-jwt";
    await Auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid Token");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a token signed with the wrong secret", async () => {
    req.cookies.token = jwt.sign({ id: "user1" }, "wrong-secret-key-abcdef");
    await Auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid Token");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for an expired token", async () => {
    req.cookies.token = jwt.sign({ id: "user1" }, SECRET, { expiresIn: "-1s" });
    await Auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid Token");
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.userId for a valid token", async () => {
    const userId = "abc123def456";
    req.cookies.token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });
    await Auth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(userId);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("does not include the token in the response body", async () => {
    const userId = "user789";
    req.cookies.token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });
    await Auth(req, res, next);
    expect(res.send).not.toHaveBeenCalled();
  });
});
