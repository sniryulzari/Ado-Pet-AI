const jwt = require("jsonwebtoken");

async function Auth(req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    res.status(401).send("Token Required");
    return;
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send("Invalid Token");
      return;
    }
    if (decoded) {
      req.userId = decoded.id;

      next();
    }
  });
}

module.exports = { Auth };
