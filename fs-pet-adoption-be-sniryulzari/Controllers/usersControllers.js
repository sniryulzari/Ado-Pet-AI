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
  getSavedPetsModel,
  getRecommendationsModel,
  saveRefreshTokenModel,
  getUserByRefreshTokenModel,
  clearRefreshTokenModel,
} = require("../Models/usersModel");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail, sendAdoptionConfirmationEmail } = require("../utils/emailService");
const Pet = require("../Schemas/petsSchemas");
const User = require("../Schemas/userSchemas");
require("dotenv").config();

const FIFTEEN_MIN_MS  = 15 * 60 * 1000;
const SEVEN_DAYS_MS   = 7 * 24 * 60 * 60 * 1000;

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

async function login(req, res) {
  try {
    const { user } = req.body;
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = (maxAge) => ({
      maxAge,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    // Short-lived access token (15 min)
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "15m" });
    res.cookie("token", token, cookieOpts(FIFTEEN_MIN_MS));

    // Long-lived refresh token (7 days) — stored hashed in DB to allow revocation
    const rawRefresh = crypto.randomBytes(40).toString("hex");
    const hashedRefresh = crypto.createHash("sha256").update(rawRefresh).digest("hex");
    const refreshExpires = new Date(Date.now() + SEVEN_DAYS_MS);
    await saveRefreshTokenModel(user._id, hashedRefresh, refreshExpires);
    res.cookie("refreshToken", rawRefresh, cookieOpts(SEVEN_DAYS_MS));

    res.send({ id: user._id, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
}

async function logout(req, res) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    };

    // Revoke refresh token in DB if present
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");
      const user = await getUserByRefreshTokenModel(hashed);
      if (user) await clearRefreshTokenModel(user._id);
    }

    res.clearCookie("token", cookieOpts);
    res.clearCookie("refreshToken", cookieOpts);
    res.send({ ok: true });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).send("Server error");
  }
}

async function savePet(req, res) {
  try {
    await savePetModel(req.params, req.userId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Save pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteSavedPet(req, res) {
  try {
    await deleteSavePetModel(req.params, req.userId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Delete saved pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function adoptPet(req, res) {
  try {
    const { petId } = req.params;
    const userId = req.userId;
    await adoptPetModel(petId, userId);
    res.send({ userId });

    // Fire-and-forget confirmation email — don't block the response
    try {
      const [user, pet] = await Promise.all([
        User.findById(userId).select("email firstName lastName"),
        Pet.findById(petId).select("name type breed imageUrl"),
      ]);
      if (user && pet) {
        await sendAdoptionConfirmationEmail({
          toEmail:    user.email,
          userName:   user.firstName,
          petName:    pet.name,
          petType:    pet.type,
          petBreed:   pet.breed,
          petImageUrl: pet.imageUrl,
          action:     "adopted",
        });
      }
    } catch (emailErr) {
      console.error("Adoption confirmation email failed:", emailErr.message);
    }
  } catch (err) {
    console.error("Adopt pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function fosterPet(req, res) {
  try {
    const { petId } = req.params;
    const userId = req.userId;
    await fosterPetModel(petId, userId);
    res.send({ userId });

    // Fire-and-forget confirmation email
    try {
      const [user, pet] = await Promise.all([
        User.findById(userId).select("email firstName lastName"),
        Pet.findById(petId).select("name type breed imageUrl"),
      ]);
      if (user && pet) {
        await sendAdoptionConfirmationEmail({
          toEmail:    user.email,
          userName:   user.firstName,
          petName:    pet.name,
          petType:    pet.type,
          petBreed:   pet.breed,
          petImageUrl: pet.imageUrl,
          action:     "fostered",
        });
      }
    } catch (emailErr) {
      console.error("Foster confirmation email failed:", emailErr.message);
    }
  } catch (err) {
    console.error("Foster pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function returnPet(req, res) {
  try {
    await returnPetModel(req.params.petId, req.userId);
    res.send({ userId: req.userId });
  } catch (err) {
    console.error("Return pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getMyPets(req, res) {
  try {
    const myPets = await myPetsModel(req.userId);
    res.send(myPets);
  } catch (err) {
    console.error("Get my pets error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getUserInfoById(req, res) {
  try {
    const userInfo = await getUserInfoByIdModel(req.userId);
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
    const userId = req.userId;
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
    // Return the updated profileImage URL so the frontend can update the
    // navbar avatar immediately without a second GET /getUserInfo round-trip.
    res.send({ ok: true, profileImage: updates.profileImage ?? null });
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
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

async function refreshToken(req, res) {
  try {
    const { refreshToken: rawToken } = req.cookies;
    if (!rawToken) return res.status(401).send("No refresh token");

    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await getUserByRefreshTokenModel(hashed);
    if (!user) return res.status(401).send("Invalid or expired refresh token");

    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = (maxAge) => ({
      maxAge,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    // Issue new access token
    const newToken = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "15m" });
    res.cookie("token", newToken, cookieOpts(FIFTEEN_MIN_MS));

    // Rotate refresh token (prevents reuse of stolen tokens)
    const newRaw = crypto.randomBytes(40).toString("hex");
    const newHashed = crypto.createHash("sha256").update(newRaw).digest("hex");
    const newExpires = new Date(Date.now() + SEVEN_DAYS_MS);
    await saveRefreshTokenModel(user._id, newHashed, newExpires);
    res.cookie("refreshToken", newRaw, cookieOpts(SEVEN_DAYS_MS));

    res.send({ ok: true });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getSavedPets(req, res) {
  try {
    const pets = await getSavedPetsModel(req.userId);
    res.send(pets);
  } catch (err) {
    console.error("Get saved pets error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getRecommendations(req, res) {
  try {
    const pets = await getRecommendationsModel(req.userId);
    res.send(pets);
  } catch (err) {
    console.error("Get recommendations error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
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
  getSavedPets,
  getRecommendations,
};
