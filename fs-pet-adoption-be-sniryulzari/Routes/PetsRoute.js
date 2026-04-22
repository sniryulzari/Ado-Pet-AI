const express = require("express");
const router = express.Router();
const PetsController = require("../Controllers/petsControllers");
const { filterQuery } = require("../Middleware/PetsMiddleware");
const { Auth } = require("../Middleware/AuthMiddleWare");

router.get("/search", filterQuery, PetsController.searchPets);
router.get("/stats", PetsController.getPetStats);
router.get("/:petId", PetsController.getPetById);

// These three routes mutate DB state — Auth is required.
// Previously they had no auth middleware, meaning anyone on the internet
// could mark any pet as adopted/fostered/returned without being logged in.
router.put("/adopt", Auth, PetsController.adoptPetStatus);
router.put("/foster", Auth, PetsController.fosterPetStatus);
router.put("/returnPet", Auth, PetsController.returnPet);

router.get("/mySavedPets/:petId", PetsController.getMySavedPet);
router.get("/myAdoptedPets/:petId", PetsController.getMyAdoptedPet);
router.get("/myFosteredPets/:petId", PetsController.getMyFosteredPet);

router.post("/:petId/reviews", Auth, PetsController.addReview);
router.delete("/:petId/reviews/:reviewId", Auth, PetsController.deleteReview);

module.exports = router;
