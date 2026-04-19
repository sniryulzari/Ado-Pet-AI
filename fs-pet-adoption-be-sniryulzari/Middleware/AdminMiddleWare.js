const User = require("../Schemas/userSchemas");

// Previously the `await` was outside the try block, so a DB error would crash
// the middleware without sending a response. Now the entire operation is guarded.
async function isAdmin(req, res, next) {
  try {
    const userId = req.userId;
    const userInfo = await User.findById(userId);

    if (!userInfo) {
      return res.status(401).send("User not found");
    }

    if (userInfo.isAdmin) {
      return next();
    }

    res.status(403).send("Forbidden access");
  } catch (error) {
    console.error("Admin auth error:", error.message);
    res.status(500).send("Server error");
  }
}

module.exports = { isAdmin };
