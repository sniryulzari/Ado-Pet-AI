const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { sendContactMessage } = require("../Controllers/ContactController");

// Prevent contact-form spam — 5 messages per IP per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many messages sent. Please try again later.",
});

router.post("/send", contactLimiter, sendContactMessage);

module.exports = router;
