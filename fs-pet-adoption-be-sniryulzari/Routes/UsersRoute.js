const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const UsersController = require("../Controllers/usersControllers");
const { validatebody } = require("../Middleware/Validatebody");
const { signupSchema, loginSchema, editUserSettingsSchema } = require("../Schemas/allSchemas");
const { passwordMatch, isNewUser, isExistingUser, hashPassword, verifyPassword } = require("../Middleware/UsersMiddleware");
const { Auth } = require("../Middleware/AuthMiddleWare");
const { upload, uploadToCloudinary } = require("../Middleware/ImagesMiddleware");

// Limit auth endpoints to 10 attempts per IP per 15 minutes to block brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts from this IP, please try again in 15 minutes",
});

router.post("/signup", authLimiter, validatebody(signupSchema), passwordMatch, isNewUser, hashPassword, UsersController.signup);
router.post("/login", authLimiter, validatebody(loginSchema), isExistingUser, verifyPassword, UsersController.login);

// Changed from GET to POST — GET requests must not have side effects (RFC 7231).
// Logout clears a session cookie, which is a state change.
router.post("/logout", UsersController.logout);

// Forgot/reset password — rate-limited, no auth required
router.post("/forgot-password", authLimiter, UsersController.forgotPassword);
router.post("/reset-password", authLimiter, UsersController.resetPassword);

router.get("/userInfo", Auth, UsersController.getUserInfoById);
// upload.single runs before validatebody so multer populates req.body from FormData first.
// For plain JSON requests (no file), multer skips silently and express.json() has already
// populated req.body — both paths end up with the same req.body shape.
router.put("/userInfo", Auth, upload.single("profileImage"), uploadToCloudinary, validatebody(editUserSettingsSchema), hashPassword, UsersController.editUser);

// GET /savedPets must be declared before PUT /:petId — otherwise Express would
// try to match "savedPets" as a petId parameter.
router.get("/savedPets", Auth, UsersController.getSavedPets);

router.put("/:petId", Auth, UsersController.savePet);
router.delete("/:petId", Auth, UsersController.deleteSavedPet);
router.put("/adopt/:petId", Auth, UsersController.adoptPet);
router.put("/foster/:petId", Auth, UsersController.fosterPet);
router.delete("/returnPet/:petId", Auth, UsersController.returnPet);
router.get("/mypets", Auth, UsersController.getMyPets);

module.exports = router;
