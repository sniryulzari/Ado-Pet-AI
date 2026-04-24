import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { getRecommendations } from "../api/users";
import { UsersContext } from "../Context/Context-Users";
import SearchPetCard from "../components/Search-PetCard";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

export default function Recommendations() {
  const [pets, setPets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn }        = useContext(UsersContext);
  const navigate              = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    getRecommendations()
      .then((res) => setPets(res.data))
      .catch(() => toast.error("Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="recommendations-empty">
        <FaStar size="3em" className="recommendations-empty__icon" />
        <h2>Log in to see your personalised picks</h2>
        <p>We tailor recommendations based on the pets you've saved, fostered, or adopted.</p>
        <button className="rec-login-btn" onClick={() => navigate("/")}>Log In</button>
      </div>
    );
  }

  if (loading) return <Spinner />;

  return (
    <div className="recommendations-page">
      <motion.div
        className="recommendations-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="recommendations-title">
          <FaStar className="rec-star-icon" /> Just for You
        </h1>
        <p className="recommendations-subtitle">
          {pets.length > 0
            ? "Based on your history, we think you'll love these pets."
            : "Start saving, fostering, or adopting pets to get personalised recommendations!"}
        </p>
      </motion.div>

      {pets.length === 0 ? (
        <div className="recommendations-empty">
          <span style={{ fontSize: "4rem" }}>🐾</span>
          <h3>No recommendations yet</h3>
          <p>Browse our pets and save the ones you like — we'll suggest similar ones!</p>
          <button className="rec-login-btn" onClick={() => navigate("/search")}>Browse Pets</button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {pets.map((pet, i) => (
            <SearchPetCard
              key={pet._id}
              id={pet._id}
              name={pet.name}
              type={pet.type}
              breed={pet.breed}
              adoptionStatus={pet.adoptionStatus}
              imageUrl={pet.imageUrl}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
