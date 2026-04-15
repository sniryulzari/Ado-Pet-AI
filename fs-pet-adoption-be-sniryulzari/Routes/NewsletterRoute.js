const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { subscribe } = require("../Controllers/NewsletterController");

// Tighter limit than auth endpoints — newsletter abuse (spam amplification)
// is a common attack surface. 5 subscription attempts per IP per hour.
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many subscription attempts. Please try again later.",
});

router.post("/subscribe", newsletterLimiter, subscribe);

module.exports = router;
