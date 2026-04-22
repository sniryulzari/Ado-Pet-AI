const Pets = require("../Schemas/petsSchemas");

async function searchPetsModel(petsQuery) {
  const pets = await Pets.find(petsQuery).lean();
  for (let i = pets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pets[i], pets[j]] = [pets[j], pets[i]];
  }
  return pets;
}

async function getPetByIdModel(petId) {
  return Pets.findById(petId);
}

async function adoptPetStatusModel(userId, petId) {
  return Pets.updateOne(
    { _id: petId },
    { $set: { adoptionStatus: "Adopted", userId } }
  );
}

async function fosterPetStatusModel(userId, petId) {
  return Pets.updateOne(
    { _id: petId },
    { $set: { adoptionStatus: "Fostered", userId } }
  );
}

async function returnPetModel(_userId, petId) {
  return Pets.updateOne(
    { _id: petId },
    { $set: { adoptionStatus: "Available", userId: "" } }
  );
}

// Previously three byte-for-byte identical functions: savedPetInfoModel,
// adoptedPetInfoModel, fosteredPetInfoModel. Consolidated into one.
// Controllers that called each variant now all call this single function.
async function getPetInfoModel(petId) {
  return Pets.findById(petId);
}

async function addReviewModel(petId, review) {
  return Pets.findByIdAndUpdate(
    petId,
    { $push: { reviews: review } },
    { new: true }
  );
}

async function deleteReviewModel(petId, reviewId, userId) {
  return Pets.findByIdAndUpdate(
    petId,
    { $pull: { reviews: { _id: reviewId, userId } } },
    { new: true }
  );
}

async function getPetStatsModel() {
  const [adopted, fostered, available] = await Promise.all([
    Pets.countDocuments({ adoptionStatus: "Adopted" }),
    Pets.countDocuments({ adoptionStatus: "Fostered" }),
    Pets.countDocuments({ adoptionStatus: "Available" }),
  ]);
  return { adopted, fostered, available };
}

module.exports = {
  searchPetsModel,
  getPetByIdModel,
  adoptPetStatusModel,
  fosterPetStatusModel,
  returnPetModel,
  getPetInfoModel,
  addReviewModel,
  deleteReviewModel,
  getPetStatsModel,
};
