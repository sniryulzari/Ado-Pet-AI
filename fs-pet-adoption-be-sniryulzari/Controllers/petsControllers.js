const {
  searchPetsModel,
  getPetByIdModel,
  adoptPetStatusModel,
  fosterPetStatusModel,
  returnPetModel,
  getPetInfoModel,
  addReviewModel,
  deleteReviewModel,
  getPetStatsModel,
} = require("../Models/petsModel");
const User = require("../Schemas/userSchemas");

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
    // Fixed: was `const { userId } = req.userId` which always destructured
    // from a string (undefined), so userId was always undefined and the DB write silently failed.
    const userId = req.userId;
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
    const userId = req.userId;
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
    const userId = req.userId;
    const { petId } = req.body;
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

async function addReview(req, res) {
  try {
    const { petId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).send("rating and comment are required");
    if (rating < 1 || rating > 5) return res.status(400).send("rating must be 1–5");

    const user = await User.findById(req.userId).select("firstName lastName adoptPet fosterPet");
    if (!user) return res.status(401).send("User not found");

    const hasInteracted = user.adoptPet.includes(petId) || user.fosterPet.includes(petId);
    if (!hasInteracted) return res.status(403).send("Only adopters or fosters can leave a review");

    const pet = await getPetByIdModel(petId);
    if (!pet) return res.status(404).send("Pet not found");

    const alreadyReviewed = pet.reviews.some((r) => r.userId.toString() === req.userId);
    if (alreadyReviewed) return res.status(409).send("You already reviewed this pet");

    const review = {
      userId:   req.userId,
      userName: `${user.firstName} ${user.lastName}`,
      rating:   Number(rating),
      comment,
    };
    const updated = await addReviewModel(petId, review);
    res.status(201).send(updated.reviews);
  } catch (err) {
    console.error("Add review error:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteReview(req, res) {
  try {
    const { petId, reviewId } = req.params;
    const updated = await deleteReviewModel(petId, reviewId, req.userId);
    if (!updated) return res.status(404).send("Pet or review not found");
    res.send(updated.reviews);
  } catch (err) {
    console.error("Delete review error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getPetStats(req, res) {
  try {
    const stats = await getPetStatsModel();
    res.json(stats);
  } catch (err) {
    console.error("Get pet stats error:", err.message);
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
  addReview,
  deleteReview,
  getPetStats,
};
