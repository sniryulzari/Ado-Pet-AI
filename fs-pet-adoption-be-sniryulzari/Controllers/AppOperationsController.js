const { petOfTheWeekModel } = require("../Models/appOperationsModel");

async function getPetOfTheWeek(req, res) {
  try {
    const petOfTheWeek = await petOfTheWeekModel();
    if (!petOfTheWeek || petOfTheWeek.length === 0) {
      return res.status(404).send({ message: "No pets available yet." });
    }
    res.send(petOfTheWeek);
  } catch (err) {
    console.error("getPetOfTheWeek controller error:", err);
    res.status(500).send({ message: "Failed to retrieve pet of the week." });
  }
}

module.exports = {
  getPetOfTheWeek,
};
