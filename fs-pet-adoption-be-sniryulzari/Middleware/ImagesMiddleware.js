const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Credentials moved to .env — never hardcode secrets in source
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  dest: "./images",
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

// Promisified so errors are catchable with try/catch instead of nested callbacks.
// The original code also had a bug: the callback used `err` (undefined) instead of `error`.
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    // No new image uploaded — skip Cloudinary and keep whatever imageUrl is
    // already in req.body (populated from the form data by multer).
    // addPet enforces image presence itself; editPet intentionally allows this.
    return next();
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.imageUrl = result.secure_url;
    fs.unlinkSync(req.file.path); // remove temp file on success
    next();
  } catch (error) {
    // Always clean up the temp file even on failure
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Cloudinary upload error:", error.message);
    res.status(500).send("Image upload failed");
  }
};

module.exports = { upload, uploadToCloudinary };
