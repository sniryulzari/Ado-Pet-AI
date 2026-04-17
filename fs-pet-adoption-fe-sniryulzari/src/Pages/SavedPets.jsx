import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSavedPets, unsavePet } from "../api/users";
import { toast } from "../utils/toast";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { cardVariants } from "../components/PageTransition";

export default function SavedPets() {
  const [pets, setPets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSavedPets()
      .then((res) => setPets(res.data))
      .catch(() => toast.error("Failed to load saved pets."))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (petId) => {
    try {
      await unsavePet(petId);
      setPets((prev) => prev.filter((p) => p._id !== petId));
      toast.success("Removed from saved pets.");
    } catch {
      toast.error("Failed to remove pet.");
    }
  };

  if (loading) {
    return (
      <section className="saved-pets-container">
        <p className="saved-pets-loading">Loading your saved pets…</p>
      </section>
    );
  }

  return (
    <section className="saved-pets-container">
      <div className="saved-pets-header">
        <h1 className="saved-pets-title">
          <FaHeart className="saved-pets-title-icon" /> Saved Pets
        </h1>
        <p className="saved-pets-subtitle">
          {pets.length > 0
            ? `You have ${pets.length} pet${pets.length > 1 ? "s" : ""} saved.`
            : "Your saved pets list is empty."}
        </p>
      </div>

      {pets.length === 0 ? (
        <div className="saved-pets-empty">
          <span className="saved-pets-empty-icon">🐾</span>
          <p>You haven't saved any pets yet.</p>
          <Link to="/search" className="saved-pets-browse-link">Browse pets</Link>
        </div>
      ) : (
        <div className="saved-pets-grid">
          {pets.map((pet, i) => (
            <motion.div
              key={pet._id}
              className="saved-pet-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="saved-pet-img"
                onClick={() => navigate(`/petcard?petId=${pet._id}`)}
              />
              <div className="saved-pet-body">
                <h3 className="saved-pet-name">{pet.name}</h3>
                <p className="saved-pet-breed">{pet.breed}</p>
                <span
                  className="saved-pet-status"
                  style={{ color: pet.adoptionStatus === "Available" ? "#22CC14" : "#EF233C" }}
                >
                  {pet.adoptionStatus}
                </span>
              </div>
              <div className="saved-pet-actions">
                <button
                  className="saved-pet-view-btn"
                  onClick={() => navigate(`/petcard?petId=${pet._id}`)}
                >
                  View
                </button>
                <button
                  className="saved-pet-unsave-btn"
                  onClick={() => handleUnsave(pet._id)}
                  aria-label="Remove from saved"
                >
                  <FaHeart size="0.9em" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
