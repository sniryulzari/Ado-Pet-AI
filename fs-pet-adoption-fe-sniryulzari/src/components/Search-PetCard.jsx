import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaDog } from "react-icons/fa";
import { motion } from "framer-motion";
import { UsersContext } from "../Context/Context-Users";
import { toast } from "../utils/toast";

function statusBadgeClass(status) {
  if (status === "Available") return "pet-badge pet-badge--available";
  if (status === "Adopted")   return "pet-badge pet-badge--adopted";
  return "pet-badge pet-badge--fostered";
}

function buildCloudinaryUrl(url, transforms) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/${transforms}/`);
}

function SearchPetCard({ id, breed, name, type, adoptionStatus, imageUrl, index = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, savedPetIds, toggleSavedPet } = useContext(UsersContext);
  const isSaved = savedPetIds?.has(id);

  const placeholderUrl = buildCloudinaryUrl(imageUrl, "c_fill,g_face,w_20,h_15,q_auto,f_auto,e_blur:600");
  const fullUrl       = buildCloudinaryUrl(imageUrl, "c_fill,g_face,w_500,h_375,q_auto,f_auto");

  const handleHeartClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/");
      toast.info("Please log in to save pets.");
      return;
    }
    try {
      await toggleSavedPet(id);
    } catch {
      toast.error("Failed to update saved pets.");
    }
  };

  return (
    <motion.div
      className="pet-card-modern"
      onClick={() => navigate(`/petcard?petId=${id}`)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/petcard?petId=${id}`)}
      aria-label={`View ${name}`}
    >
      {/* Image */}
      <div
        className="pet-card-modern__img-wrap"
        style={{
          backgroundImage: `url(${placeholderUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: loaded ? "none" : "blur(8px)",
          transition: "filter 0.3s ease",
        }}
      >
        <img
          src={fullUrl}
          alt={name}
          className="pet-card-modern__img"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.currentTarget.src = imageUrl; }}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
        <div className="pet-card-modern__gradient" />
        <span className="pet-card-modern__name-overlay">{name}</span>
        <button
          className={`pet-card-modern__heart${isSaved ? " pet-card-modern__heart--saved" : ""}`}
          onClick={handleHeartClick}
          aria-label={isSaved ? "Remove from saved" : "Save pet"}
        >
          {isSaved ? <FaHeart size="1em" /> : <FaRegHeart size="1em" />}
        </button>
      </div>

      {/* Info */}
      <div className="pet-card-modern__body">
        <span className="pet-card-modern__breed">
          {[type, breed].filter(Boolean).join(" · ")}
        </span>
        <div className="pet-card-modern__badges">
          {type && (
            <span className="pet-badge pet-badge--type">
              <FaDog size="0.7em" style={{ marginRight: "0.25rem" }} />
              {type}
            </span>
          )}
          <span className={statusBadgeClass(adoptionStatus)}>{adoptionStatus}</span>
        </div>
        <button
          className="pet-card-modern__cta"
          onClick={(e) => { e.stopPropagation(); navigate(`/petcard?petId=${id}`); }}
        >
          Meet {name} →
        </button>
      </div>
    </motion.div>
  );
}

export default SearchPetCard;
