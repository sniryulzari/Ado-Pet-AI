const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true },
  },
  { timestamps: true }
);

const petSchema = new Schema(
  {
    type: { type: String, required: true },
    breed: { type: String, required: true },
    name: { type: String, required: true },
    adoptionStatus: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    color: { type: String, required: true },
    bio: { type: String, required: true },
    hypoallergenic: { type: String, required: true },
    dietaryRestrictions: { type: String, required: true },
    imageUrl: { type: String },
    userSaved: { type: String },
    adopt: { type: Array },
    foster: { type: Array },
    userId: { type: String },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true },
  { collection: "pets" }
);

const Pets = mongoose.model("Pets", petSchema);

module.exports = Pets;
