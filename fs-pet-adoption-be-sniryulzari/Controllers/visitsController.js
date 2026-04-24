const { createVisitModel, getMyVisitsModel, cancelVisitModel, getAllVisitsModel, updateVisitStatusModel } = require("../Models/visitsModel");
const { sendVisitConfirmationEmail, sendVisitCancellationEmail } = require("../utils/emailService");

const VALID_TIME_SLOTS = ["Morning (9:00–12:00)", "Afternoon (12:00–16:00)", "Evening (16:00–19:00)"];

async function createVisit(req, res) {
  try {
    const { petId, date, timeSlot, notes } = req.body;
    if (!petId || !date || !timeSlot) return res.status(400).send("petId, date, and timeSlot are required");
    if (!VALID_TIME_SLOTS.includes(timeSlot)) return res.status(400).send("Invalid time slot");

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).send("Date must be today or in the future");
    }

    const visit = await createVisitModel({ userId: req.userId, petId, date, timeSlot, notes: notes || "" });
    res.status(201).send(visit);
  } catch (err) {
    console.error("Create visit error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getMyVisits(req, res) {
  try {
    const visits = await getMyVisitsModel(req.userId);
    res.send(visits);
  } catch (err) {
    console.error("Get my visits error:", err.message);
    res.status(500).send("Server error");
  }
}

async function cancelVisit(req, res) {
  try {
    const visit = await cancelVisitModel(req.params.visitId, req.userId);
    if (!visit) return res.status(404).send("Visit not found or not yours");
    res.send(visit);
  } catch (err) {
    console.error("Cancel visit error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllVisits(_req, res) {
  try {
    const visits = await getAllVisitsModel();
    res.send(visits);
  } catch (err) {
    console.error("Get all visits error:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateVisitStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) return res.status(400).send("Invalid status");
    const visit = await updateVisitStatusModel(req.params.visitId, status);
    if (!visit) return res.status(404).send("Visit not found");
    res.send(visit);

    if (status === "confirmed" || status === "cancelled") {
      try {
        const user = visit.userId;
        const pet  = visit.petId;
        if (user && pet) {
          if (status === "confirmed") {
            await sendVisitConfirmationEmail({
              toEmail:     user.email,
              userName:    user.firstName,
              petName:     pet.name,
              petType:     pet.type,
              petBreed:    pet.breed,
              petImageUrl: pet.imageUrl,
              date:        visit.date,
              timeSlot:    visit.timeSlot,
              notes:       visit.notes || "",
            });
          } else {
            await sendVisitCancellationEmail({
              toEmail:     user.email,
              userName:    user.firstName,
              petName:     pet.name,
              petType:     pet.type,
              petBreed:    pet.breed,
              petImageUrl: pet.imageUrl,
              date:        visit.date,
              timeSlot:    visit.timeSlot,
            });
          }
        }
      } catch (emailErr) {
        console.error("Visit status email failed:", emailErr.message);
      }
    }
  } catch (err) {
    console.error("Update visit status error:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = { createVisit, getMyVisits, cancelVisit, getAllVisits, updateVisitStatus };
