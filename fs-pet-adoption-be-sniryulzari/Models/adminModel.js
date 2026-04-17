const Pets = require("../Schemas/petsSchemas");
const User = require("../Schemas/userSchemas");
const Newsletter = require("../Schemas/newsletterSchema");

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

async function getStatsModel() {
  const [allPets, totalUsers, totalSubscribers] = await Promise.all([
    Pets.find().lean(),
    User.countDocuments(),
    Newsletter.countDocuments({ isActive: true }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

  const PET_TYPES = ["Dog", "Cat", "Horse", "Tiger", "Dolphin"];
  const petsByType = {};
  PET_TYPES.forEach((t) => {
    petsByType[t.toLowerCase() + "s"] = allPets.filter(
      (p) => p.type?.toLowerCase() === t.toLowerCase()
    ).length;
  });

  return {
    totalPets: allPets.length,
    availablePets: allPets.filter((p) => p.adoptionStatus === "Available").length,
    adoptedPets:   allPets.filter((p) => p.adoptionStatus === "Adopted").length,
    fosteredPets:  allPets.filter((p) => p.adoptionStatus === "Fostered").length,
    totalUsers,
    newUsersThisMonth,
    totalSubscribers,
    petsByType,
  };
}

async function getNewsletterSubscribersModel() {
  return Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 }).lean();
}

async function deleteNewsletterSubscriberModel(email) {
  return Newsletter.findOneAndDelete({ email });
}

module.exports = {
  getAllPetsModel,
  addPetModel,
  getPetByIdModel,
  getAllUsersModel,
  deletePetModel,
  editPetModel,
  getStatsModel,
  getNewsletterSubscribersModel,
  deleteNewsletterSubscriberModel,
};
