const {
  searchPetsModel,
  getPetByIdModel,
  adoptPetStatusModel,
  fosterPetStatusModel,
  returnPetModel,
  getPetInfoModel,
} = require("../Models/petsModel");

async function searchPets(req, res) {
  try {
    const pets = await searchPetsModel(req.query);
    res.send(pets);
  } catch (err) {
    console.error("Search pets error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getPetById(req, res) {
  try {
    const pet = await getPetByIdModel(req.params.petId);
    res.send(pet);
  } catch (err) {
    console.error("Get pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function adoptPetStatus(req, res) {
  try {
    // Fixed: was `const { userId } = req.body.userId` which always destructured
    // from a string (undefined), so userId was always undefined and the DB write silently failed.
    const userId = req.body.userId;
    const { petId } = req.body;
    await adoptPetStatusModel(userId, petId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Adopt pet status error:", err.message);
    res.status(500).send("Server error");
  }
}

async function fosterPetStatus(req, res) {
  try {
    // Same destructuring fix as adoptPetStatus
    const userId = req.body.userId;
    const { petId } = req.body;
    await fosterPetStatusModel(userId, petId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Foster pet status error:", err.message);
    res.status(500).send("Server error");
  }
}

async function returnPet(req, res) {
  try {
    const { userId, petId } = req.body;
    await returnPetModel(userId, petId);
    res.send({ ok: true });
  } catch (err) {
    console.error("Return pet error:", err.message);
    res.status(500).send("Server error");
  }
}

// Three previously-identical functions (savedPetInfoModel, adoptedPetInfoModel,
// fosteredPetInfoModel) are now a single getPetInfoModel — same DB call, one function.
async function getMySavedPet(req, res) {
  try {
    const petInfo = await getPetInfoModel(req.params.petId);
    res.send(petInfo);
  } catch (err) {
    console.error("Get saved pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getMyAdoptedPet(req, res) {
  try {
    const petInfo = await getPetInfoModel(req.params.petId);
    res.send(petInfo);
  } catch (err) {
    console.error("Get adopted pet error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getMyFosteredPet(req, res) {
  try {
    const petInfo = await getPetInfoModel(req.params.petId);
    res.send(petInfo);
  } catch (err) {
    console.error("Get fostered pet error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  searchPets,
  getPetById,
  adoptPetStatus,
  fosterPetStatus,
  returnPet,
  getMySavedPet,
  getMyAdoptedPet,
  getMyFosteredPet,
};
