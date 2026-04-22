const Visit = require("../Schemas/visitSchema");

async function createVisitModel({ userId, petId, date, timeSlot, notes }) {
  const visit = new Visit({ userId, petId, date, timeSlot, notes });
  await visit.save();
  return visit;
}

async function getMyVisitsModel(userId) {
  return Visit.find({ userId }).populate("petId", "name type breed imageUrl adoptionStatus").sort({ date: 1, createdAt: 1 });
}

async function cancelVisitModel(visitId, userId) {
  return Visit.findOneAndUpdate(
    { _id: visitId, userId },
    { status: "cancelled" },
    { new: true }
  );
}

async function getAllVisitsModel() {
  return Visit.find()
    .populate("petId", "name type breed imageUrl")
    .populate("userId", "firstName lastName email phoneNumber profileImage")
    .sort({ date: 1, createdAt: 1 });
}

async function updateVisitStatusModel(visitId, status) {
  return Visit.findByIdAndUpdate(visitId, { status }, { new: true })
    .populate("petId", "name type breed imageUrl")
    .populate("userId", "firstName lastName email phoneNumber profileImage");
}

module.exports = { createVisitModel, getMyVisitsModel, cancelVisitModel, getAllVisitsModel, updateVisitStatusModel };
