const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Credentials moved to .env — never hardcode secrets in source
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// memoryStorage keeps the file in RAM as req.file.buffer — no temp files on disk.
// This works in both traditional servers and serverless environments (Vercel)
// where the filesystem is read-only outside of /tmp.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

// Streams req.file.buffer directly to Cloudinary — no temp file needed.
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    // No new image uploaded — skip Cloudinary and keep whatever imageUrl is
    // already in req.body (populated from the form data by multer).
    // addPet enforces image presence itself; editPet intentionally allows this.
    return next();
  }

  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "image" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error.message);
        return res.status(500).send("Image upload failed");
      }
      req.body.imageUrl = result.secure_url;
      next();
    }
  );

  stream.end(req.file.buffer);
};

module.exports = { upload, uploadToCloudinary };
