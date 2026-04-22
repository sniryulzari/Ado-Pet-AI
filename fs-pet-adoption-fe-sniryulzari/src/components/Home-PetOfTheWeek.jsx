import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getPetOfTheWeek } from "../api/pets";
import { UsersContext } from "../Context/Context-Users";
import Spinner from "./Spinner";

function buildMarketingBio(pet) {
  if (pet.bio && pet.bio.trim().length > 10) return pet.bio;
  const name = pet.name || "This pet";
  const type = pet.type ? pet.type.toLowerCase() : "animal";
  const breed = pet.breed ? ` ${pet.breed}` : "";
  return `${name} is a charming${breed} ${type} who is ready to fill your home with love and joy. ` +
    `They're looking for a forever family — could that be you? Don't miss your chance to give ${name} the life they deserve!`;
}

const STATUS_COLOR = {
  Available: "potw-status--available",
  Adopted:   "potw-status--adopted",
  Fostered:  "potw-status--fostered",
};

function PetOfTheWeek() {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPetOfTheWeek()
      .then((res) => setPet(res.data[0] ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleAdoptClick() {
    if (isLoggedIn && pet?._id) {
      navigate(`/petcard?petId=${pet._id}`);
    } else {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const metaItems = [
    pet?.type,
    pet?.breed,
    pet?.age != null ? `${pet.age} yr${pet.age !== 1 ? "s" : ""} old` : null,
  ].filter(Boolean);

  return (
    <section className="home-pet-of-the-week-container">
      <div className="potw-section-label">
        <span className="potw-star" aria-hidden="true">★</span>
        <span>Meet Our</span>
        <span className="potw-star" aria-hidden="true">★</span>
      </div>
      <h2 className="pet-of-the-week-heading-bottom">Pet of the Week</h2>

      <motion.div
        className="potw-featured-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* LEFT — large image */}
        <div className="potw-image-panel">
          <div className="pet-of-the-week-ring">
            {pet?.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.name || "pet of the week"}
                className="pet-of-the-week-image"
              />
            ) : (
              <div className="pet-of-the-week-placeholder">🐾</div>
            )}
          </div>

          {pet?.adoptionStatus && (
            <span className={`potw-status-badge ${STATUS_COLOR[pet.adoptionStatus] ?? ""}`}>
              {pet.adoptionStatus}
            </span>
          )}
        </div>

        {/* RIGHT — info + CTA */}
        <div className="pet-of-the-week-card-right">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {pet?.name && (
                <h3 className="pet-name">{pet.name}</h3>
              )}

              {metaItems.length > 0 && (
                <div className="potw-meta-pills">
                  {metaItems.map((item) => (
                    <span key={item} className="potw-meta-pill">{item}</span>
                  ))}
                </div>
              )}

              <p className="pet-bio">{buildMarketingBio(pet ?? {})}</p>

              <button
                className="pet-of-the-week-button"
                onClick={handleAdoptClick}
              >
                {isLoggedIn
                  ? `Meet ${pet?.name ?? "this pet"} →`
                  : "Login to Adopt"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default PetOfTheWeek;
