const {
  getAllPetsModel,
  addPetModel,
  getPetByIdModel,
  getAllUsersModel,
  deletePetModel,
  editPetModel,
} = require("../Models/adminModel");

async function getAllPets(_req, res) {
  try {
    const allPets = await getAllPetsModel();
    res.send(allPets);
  } catch (err) {
    console.error("Get all pets error:", err.message);
    res.status(500).send("Server error");
  }
}

async function addPet(req, res) {
  try {
    const { type, breed, name, adoptionStatus, height, weight, color, bio, hypoallergenic, dietaryRestrictions, imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).send("Pet image is required");
    }
    const newPet = { type, breed, name, adoptionStatus, height, weight, color, bio, hypoallergenic, dietaryRestrictions, imageUrl };
    const pet = await addPetModel(newPet);
    res.status(201).send(pet);
  } catch (err) {
    console.error("Add pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getPetById(req, res) {
  try {
    const petInfo = await getPetByIdModel(req.params.petId);
    res.send(petInfo);
  } catch (err) {
    console.error("Get pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllUsers(_req, res) {
  try {
    const allUsers = await getAllUsersModel();
    res.send(allUsers);
  } catch (err) {
    console.error("Get all users error:", err.message);
    res.status(500).send("Server error");
  }
}

async function deletePet(req, res) {
  try {
    await deletePetModel(req.params.petId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Delete pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function editPet(req, res) {
  try {
    // Previously destructured 11 variables then ignored them all, passing req.body
    // directly to the model. Now explicitly whitelisting what is allowed to update.
    const { type, breed, name, adoptionStatus, height, weight, color, bio, hypoallergenic, dietaryRestrictions, imageUrl, _id } = req.body;
    const updates = { type, breed, name, adoptionStatus, height, weight, color, bio, hypoallergenic, dietaryRestrictions, imageUrl };
    await editPetModel(updates, _id);
    res.send({ ok: true });
  } catch (err) {
    console.error("Edit pet error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = { addPet, getAllPets, getPetById, getAllUsers, deletePet, editPet };
