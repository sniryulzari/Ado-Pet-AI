const User = require("../Schemas/userSchemas");

// Models no longer catch errors internally — they let them propagate so each
// controller's try/catch handles them in one place. Previously every model
// swallowed errors with console.log and returned undefined, which controllers
// then passed to res.send() silently.

async function signupModel(newUser) {
  const user = new User(newUser);
  await user.save();
  return user;
}

async function getUserByEmailModel(email) {
  return User.findOne({ email });
}

async function savePetModel(petId, userId) {
  return User.updateOne(
    { _id: userId },
    { $push: { savedPet: petId.petId } }
  );
}

async function deleteSavePetModel(petId, userId) {
  return User.updateOne(
    { _id: userId },
    { $pull: { savedPet: petId.petId } }
  );
}

async function adoptPetModel(petId, userId) {
  // Previously three sequential updateOne calls (3 round-trips).
  // MongoDB supports $push and $pull on different fields in a single atomic operation.
  return User.updateOne(
    { _id: userId },
    {
      $push: { adoptPet: petId },
      $pull: { savedPet: petId, fosterPet: petId },
    }
  );
}

async function fosterPetModel(petId, userId) {
  // Same single-operation fix as adoptPetModel
  return User.updateOne(
    { _id: userId },
    {
      $push: { fosterPet: petId },
      $pull: { savedPet: petId, adoptPet: petId },
    }
  );
}

async function returnPetModel(petId, userId) {
  return User.updateOne(
    { _id: userId },
    { $pull: { adoptPet: petId, fosterPet: petId } }
  );
}

async function myPetsModel(userId) {
  // Changed from find() (returns array) to findById() (returns document directly)
  return User.findById(userId);
}

async function getUserInfoByIdModel(userId) {
  return User.findById(userId);
}

// Fixed typo: editUserdModel → editUserModel
async function editUserModel(userId, newUserInfo) {
  return User.findByIdAndUpdate(userId, newUserInfo);
}

async function saveResetTokenModel(userId, token, expires) {
  return User.findByIdAndUpdate(userId, {
    resetPasswordToken: token,
    resetPasswordExpires: expires,
  });
}

async function getUserByResetTokenModel(token) {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
}

async function resetPasswordModel(userId, hashedPassword) {
  return User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });
}

async function getSavedPetsModel(userId) {
  const Pet = require("../Schemas/petsSchemas");
  const user = await User.findById(userId).select("savedPet");
  if (!user) return [];
  return Pet.find({ _id: { $in: user.savedPet } });
}

async function getRecommendationsModel(userId) {
  const Pet = require("../Schemas/petsSchemas");
  const user = await User.findById(userId).select("savedPet adoptPet fosterPet");
  if (!user) return [];

  const interactedIds = [
    ...(user.savedPet || []),
    ...(user.adoptPet || []),
    ...(user.fosterPet || []),
  ];

  let recommendations = [];

  if (interactedIds.length > 0) {
    const interactedPets = await Pet.find({ _id: { $in: interactedIds } }).select("type");
    const preferredTypes = [...new Set(interactedPets.map((p) => p.type))];

    recommendations = await Pet.find({
      adoptionStatus: "Available",
      _id: { $nin: interactedIds },
      type: { $in: preferredTypes },
    }).limit(12);

    // Fisher-Yates shuffle
    for (let i = recommendations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
    }
    recommendations = recommendations.slice(0, 8);
  }

  // Pad with newest available pets if we don't have enough
  if (recommendations.length < 8) {
    const existingIds = recommendations.map((p) => p._id);
    const fallback = await Pet.find({
      adoptionStatus: "Available",
      _id: { $nin: [...interactedIds, ...existingIds] },
    })
      .sort({ createdAt: -1 })
      .limit(8 - recommendations.length);
    recommendations = [...recommendations, ...fallback];
  }

  return recommendations;
}

async function saveRefreshTokenModel(userId, hashedToken, expires) {
  return User.findByIdAndUpdate(userId, {
    refreshToken: hashedToken,
    refreshTokenExpires: expires,
  });
}

async function getUserByRefreshTokenModel(hashedToken) {
  return User.findOne({
    refreshToken: hashedToken,
    refreshTokenExpires: { $gt: new Date() },
  });
}

async function clearRefreshTokenModel(userId) {
  return User.findByIdAndUpdate(userId, {
    refreshToken: null,
    refreshTokenExpires: null,
  });
}

module.exports = {
  signupModel,
  getUserByEmailModel,
  savePetModel,
  deleteSavePetModel,
  adoptPetModel,
  fosterPetModel,
  returnPetModel,
  myPetsModel,
  getUserInfoByIdModel,
  editUserModel,
  saveResetTokenModel,
  getUserByResetTokenModel,
  resetPasswordModel,
  getSavedPetsModel,
  getRecommendationsModel,
  saveRefreshTokenModel,
  getUserByRefreshTokenModel,
  clearRefreshTokenModel,
};
