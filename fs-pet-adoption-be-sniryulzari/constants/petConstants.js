// Single source of truth for values used across routes, controllers, and models.
// Import these instead of using magic strings scattered throughout the codebase.

const ADOPTION_STATUS = {
  AVAILABLE: "Available",
  ADOPTED: "Adopted",
  FOSTERED: "Fostered",
};

const PET_TYPES = ["Dog", "Cat", "Horse", "Dolphin", "Tiger"];

module.exports = { ADOPTION_STATUS, PET_TYPES };
