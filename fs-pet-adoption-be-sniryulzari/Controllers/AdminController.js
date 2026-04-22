const {
  getAllPetsModel,
  addPetModel,
  getPetByIdModel,
  getAllUsersModel,
  deletePetModel,
  editPetModel,
  getStatsModel,
  getNewsletterSubscribersModel,
  deleteNewsletterSubscriberModel,
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

async function getStats(_req, res) {
  try {
    const stats = await getStatsModel();
    res.send(stats);
  } catch (err) {
    console.error("Get stats error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getNewsletterSubscribers(_req, res) {
  try {
    const subscribers = await getNewsletterSubscribersModel();
    res.send({ count: subscribers.length, subscribers });
  } catch (err) {
    console.error("Get subscribers error:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteNewsletterSubscriber(req, res) {
  try {
    const email = decodeURIComponent(req.params.email);
    await deleteNewsletterSubscriberModel(email);
    res.send({ ok: true });
  } catch (err) {
    console.error("Delete subscriber error:", err.message);
    res.status(500).send("Server error");
  }
}

function escapeCSV(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows, headers) {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((row) => headers.map((h) => escapeCSV(row[h])).join(","));
  return [headerLine, ...dataLines].join("\n");
}

async function exportPetsCSV(_req, res) {
  try {
    const pets = await getAllPetsModel();
    const headers = ["_id", "name", "type", "breed", "adoptionStatus", "height", "weight", "color", "hypoallergenic", "dietaryRestrictions", "createdAt"];
    const csv = toCSV(pets.map((p) => p.toObject()), headers);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=pets.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export pets CSV error:", err.message);
    res.status(500).send("Server error");
  }
}

async function exportUsersCSV(_req, res) {
  try {
    const users = await getAllUsersModel();
    const headers = ["_id", "firstName", "lastName", "email", "phoneNumber", "isAdmin", "createdAt"];
    const csv = toCSV(users.map((u) => u.toObject()), headers);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export users CSV error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  addPet, getAllPets, getPetById, getAllUsers, deletePet, editPet,
  getStats, getNewsletterSubscribers, deleteNewsletterSubscriber,
  exportPetsCSV, exportUsersCSV,
};
