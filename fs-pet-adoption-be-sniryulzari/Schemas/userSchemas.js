const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    bio: { type: String },
    isAdmin: { type: Boolean, default: false },
    savedPet: { type: Array },
    adoptPet: { type: Array },
    fosterPet: { type: Array },
    petOwner: { type: String },
    profileImage: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { collection: "users" }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
