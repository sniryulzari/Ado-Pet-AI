const mongoose = require("mongoose");
const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    userId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    petId:    { type: Schema.Types.ObjectId, ref: "Pets", required: true },
    date:     { type: String, required: true },   // ISO date string "YYYY-MM-DD"
    timeSlot: { type: String, required: true, enum: ["Morning (9:00–12:00)", "Afternoon (12:00–16:00)", "Evening (16:00–19:00)"] },
    status:   { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
    notes:    { type: String, default: "" },
  },
  { timestamps: true }
);

const Visit = mongoose.model("Visit", visitSchema);
module.exports = Visit;
