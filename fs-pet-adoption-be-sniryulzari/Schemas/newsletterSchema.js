const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscribedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { collection: "newsletter_subscribers" }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
