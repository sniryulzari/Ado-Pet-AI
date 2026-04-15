const Pets = require("../Schemas/petsSchemas");
const User = require("../Schemas/userSchemas");

async function getAllPetsModel() {
  return Pets.find();
}

// Fixed naming: was AddPetModel (PascalCase — inconsistent with every other function)
async function addPetModel(newPet) {
  const pet = new Pets(newPet);
  await pet.save();
  return pet;
}

async function getPetByIdModel(petId) {
  return Pets.findById(petId);
}

async function getAllUsersModel() {
  return User.find().select("-password");
}

async function deletePetModel(petId) {
  return Pets.findOneAndDelete({ _id: petId });
}

async function editPetModel(newPet, petId) {
  return Pets.findByIdAndUpdate(petId, newPet);
}

module.exports = {
  getAllPetsModel,
  addPetModel,
  getPetByIdModel,
  getAllUsersModel,
  deletePetModel,
  editPetModel,
};
