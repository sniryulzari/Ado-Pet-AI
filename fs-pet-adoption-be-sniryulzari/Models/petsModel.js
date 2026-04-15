const Pets = require("../Schemas/petsSchemas");

async function searchPetsModel(petsQuery) {
  return Pets.find(petsQuery);
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

module.exports = {
  searchPetsModel,
  getPetByIdModel,
  adoptPetStatusModel,
  fosterPetStatusModel,
  returnPetModel,
  getPetInfoModel,
};
