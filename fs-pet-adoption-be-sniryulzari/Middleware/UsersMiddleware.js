const { getUserByEmailModel } = require("../Models/usersModel");
const bcrypt = require("bcrypt");

function passwordMatch(req, res, next) {
  if (req.body.password === req.body.repassword) {
    return next();
  }
  res.status(400).send("Passwords do not match");
}

async function isNewUser(req, res, next) {
  const user = await getUserByEmailModel(req.body.email);
  if (user) {
    return res.status(400).send("An account with this email already exists");
  }
  next();
}

function hashPassword(req, res, next) {
  const { password } = req.body;
  // Empty string means "keep current password" — skip hashing and remove the
  // field so the update query doesn't overwrite the stored hash with garbage.
  if (!password) {
    delete req.body.password;
    return next();
  }
  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters");
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send("Server error");
    }
    req.body.password = hash;
    next();
  });
}

async function isExistingUser(req, res, next) {
  const user = await getUserByEmailModel(req.body.email);
  if (user) {
    req.body.user = user;
    return next();
  }
  // Generic message — same wording as wrong-password reply — prevents email enumeration.
  // An attacker can no longer tell whether an email is registered by comparing error messages.
  res.status(400).send("Invalid email or password");
}

async function verifyPassword(req, res, next) {
  const { user } = req.body;
  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (err) {
      return res.status(500).send("Server error");
    }
    if (result) {
      return next();
    }
    // Same generic message as isExistingUser — prevents email enumeration
    res.status(400).send("Invalid email or password");
  });
}

module.exports = { passwordMatch, isNewUser, hashPassword, isExistingUser, verifyPassword };
