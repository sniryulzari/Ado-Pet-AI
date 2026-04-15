const {
  signupModel,
  savePetModel,
  deleteSavePetModel,
  adoptPetModel,
  fosterPetModel,
  returnPetModel,
  myPetsModel,
  getUserInfoByIdModel,
  editUserModel,
  saveResetTokenModel,
  getUserByResetTokenModel,
  resetPasswordModel,
  getUserByEmailModel,
} = require("../Models/usersModel");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail } = require("../utils/emailService");
require("dotenv").config();

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

async function signup(req, res) {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const newUser = { firstName, lastName, phoneNumber, email, password };
    const user = await signupModel(newUser);
    // Return only what the client needs — never echo back the password hash
    res.status(201).send({ email: user.email, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).send("Server error");
  }
}

function login(req, res) {
  try {
    const { user } = req.body;
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "2h",
    });
    // Cookie maxAge matches JWT expiry exactly (2 hours).
    // secure flag is tied to NODE_ENV — not the literal expression `true / false`
    // which previously evaluated to 1 (always truthy).
    // Token is NOT included in the response body — the httpOnly cookie is the
    // only token carrier. Putting the token in the body and localStorage defeats
    // the XSS protection that httpOnly cookies provide.
    // sameSite:"none" requires secure:true — browsers silently reject the cookie
    // otherwise. In development (localhost) both ports are the same site so
    // sameSite:"lax" works and doesn't require HTTPS.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      maxAge: TWO_HOURS_MS,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });
    res.send({ id: user._id, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
}

function logout(_req, res) {
  try {
    // clearCookie must pass the same options used when setting the cookie,
    // otherwise some browsers won't honour the clear instruction.
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });
    res.send({ ok: true });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).send("Server error");
  }
}

async function savePet(req, res) {
  try {
    await savePetModel(req.params, req.body.userId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Save pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteSavedPet(req, res) {
  try {
    await deleteSavePetModel(req.params, req.body.userId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Delete saved pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function adoptPet(req, res) {
  try {
    await adoptPetModel(req.params.petId, req.body.userId);
    res.send({ userId: req.body.userId });
  } catch (err) {
    console.error("Adopt pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function fosterPet(req, res) {
  try {
    await fosterPetModel(req.params.petId, req.body.userId);
    res.send({ userId: req.body.userId });
  } catch (err) {
    console.error("Foster pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function returnPet(req, res) {
  try {
    await returnPetModel(req.params.petId, req.body.userId);
    res.send({ userId: req.body.userId });
  } catch (err) {
    console.error("Return pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getMyPets(req, res) {
  try {
    const myPets = await myPetsModel(req.body.userId);
    res.send(myPets);
  } catch (err) {
    console.error("Get my pets error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getUserInfoById(req, res) {
  try {
    const userInfo = await getUserInfoByIdModel(req.body.userId);
    // Strip the password hash — clients have no legitimate use for it,
    // and sending it exposes data that could be targeted for offline attacks.
    const { password: _pw, ...safeUser } = userInfo.toObject();
    res.send(safeUser);
  } catch (err) {
    console.error("Get user info error:", err.message);
    res.status(500).send("Server error");
  }
}

async function editUser(req, res) {
  try {
    const userId = req.body.userId;
    // Whitelist the fields that users are allowed to update.
    // Previously the entire req.body was passed to findByIdAndUpdate, which
    // combined with additionalProperties:true in the schema allowed any user
    // to set isAdmin:true on their own account (privilege escalation).
    const { firstName, lastName, phoneNumber, email, password, bio } = req.body;
    const updates = { firstName, lastName, phoneNumber, email, bio };
    // password is only present if hashPassword hashed a non-empty input
    if (password) updates.password = password;
    // imageUrl is set by the Cloudinary upload middleware when a profile image is uploaded
    if (req.body.imageUrl) updates.profileImage = req.body.imageUrl;
    await editUserModel(userId, updates);
    res.send({ ok: true });
  } catch (err) {
    console.error("Edit user error:", err.message);
    res.status(500).send("Server error");
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("Email is required");

    // Always return the same response to prevent email enumeration
    const GENERIC_RESPONSE = "If this email is registered, you will receive a reset link shortly.";

    const user = await getUserByEmailModel(email);
    if (!user) return res.send({ message: GENERIC_RESPONSE });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await saveResetTokenModel(user._id, token, expires);

    const isProd = process.env.NODE_ENV === "production";
    const frontendUrl = isProd
      ? "https://pet-adoption-133f.onrender.com"
      : "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);

    res.send({ message: GENERIC_RESPONSE });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).send("Server error");
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).send("Token and password are required");
    if (password.length < 6) return res.status(400).send("Password must be at least 6 characters");

    const user = await getUserByResetTokenModel(token);
    if (!user) return res.status(400).send("Invalid or expired reset link");

    const hashedPassword = await bcrypt.hash(password, 10);
    await resetPasswordModel(user._id, hashedPassword);

    res.send({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  signup,
  login,
  logout,
  savePet,
  deleteSavedPet,
  adoptPet,
  fosterPet,
  returnPet,
  getMyPets,
  getUserInfoById,
  editUser,
  forgotPassword,
  resetPassword,
};
