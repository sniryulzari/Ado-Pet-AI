const Pets = require("../Schemas/petsSchemas");
const AppOperations = require("../Schemas/AppOperationsSchemas");

const AVAILABLE = "Available";

async function petOfTheWeekModel() {
  try {
    let currentDay = new Date().getDay();
    let doc = await AppOperations.findOne({});

    if (!doc) {
      // Collection is empty — seed a default document with a random available pet
      const petInfo = await randomizedPet();
      await AppOperations.create({
        isRandomized: true,
        petsOfTheWeek: petInfo ? [petInfo._id] : [],
        petsOfTheWeekInfo: petInfo || null,
      });
      return petInfo ? [petInfo] : [];
    }

    const isRandomized = doc.isRandomized;

    if (currentDay === 0 && !isRandomized) {
      // Sunday — pick a new pet for the week
      const petInfo = await randomizedPet();
      if (petInfo) {
        await AppOperations.updateOne(
          { _id: doc._id },
          {
            $push: { petsOfTheWeek: petInfo._id },
            $set: { isRandomized: true, petsOfTheWeekInfo: petInfo },
          }
        );
      }
      return petInfo ? [petInfo] : [];
    }

    if (currentDay === 1 && isRandomized) {
      // Monday — reset the flag so next Sunday triggers a new pick
      await AppOperations.updateOne(
        { _id: doc._id },
        { $set: { isRandomized: false } }
      );
    }

    return getPetOfTheWeek(doc._id);
  } catch (err) {
    console.error("petOfTheWeekModel error:", err);
    const fallback = await randomizedPet();
    return fallback ? [fallback] : [];
  }
}

// Only pick from pets that are currently available for adoption
async function randomizedPet() {
  try {
    const availablePets = await Pets.find({ adoptionStatus: AVAILABLE }, { _id: 1 });
    if (!availablePets.length) return null;
    const rnd = Math.floor(Math.random() * availablePets.length);
    return Pets.findById(availablePets[rnd]._id);
  } catch (err) {
    console.error("randomizedPet error:", err);
    return null;
  }
}

// Return the stored pet of the week, but re-randomize if it is no longer available
async function getPetOfTheWeek(docId) {
  try {
    const doc = await AppOperations.findById(docId, { petsOfTheWeekInfo: 1 });
    if (!doc || !doc.petsOfTheWeekInfo) return [];

    const storedPetId = doc.petsOfTheWeekInfo._id;
    if (storedPetId) {
      // Check the pet's live status in case it was adopted/fostered this week
      const livePet = await Pets.findById(storedPetId, { adoptionStatus: 1 });
      if (!livePet || livePet.adoptionStatus !== AVAILABLE) {
        // Pet is gone — pick a fresh available one and persist it
        const newPet = await randomizedPet();
        if (newPet) {
          await AppOperations.updateOne(
            { _id: docId },
            {
              $push: { petsOfTheWeek: newPet._id },
              $set: { petsOfTheWeekInfo: newPet },
            }
          );
          return [newPet];
        }
        return [];
      }
    }

    return [doc.petsOfTheWeekInfo];
  } catch (err) {
    console.error("getPetOfTheWeek error:", err);
    return [];
  }
}

module.exports = {
  petOfTheWeekModel,
};
