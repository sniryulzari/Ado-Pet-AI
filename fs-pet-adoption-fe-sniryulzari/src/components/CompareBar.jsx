import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaBalanceScale, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { PetContext } from "../Context/Context-Pets";

export default function CompareBar() {
  const { comparePets, removeFromCompare, clearCompare } = useContext(PetContext);
  const navigate = useNavigate();

  if (comparePets.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="compare-bar"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="compare-bar__label">
          <FaBalanceScale /> Compare ({comparePets.length}/2)
        </div>

        <div className="compare-bar__pets">
          {comparePets.map((pet) => (
            <div key={pet._id} className="compare-bar__pet">
              {pet.imageUrl && <img src={pet.imageUrl} alt={pet.name} className="compare-bar__pet-img" />}
              <span className="compare-bar__pet-name">{pet.name}</span>
              <button
                className="compare-bar__remove"
                onClick={() => removeFromCompare(pet._id)}
                aria-label={`Remove ${pet.name}`}
              >
                <FaTimes size="0.75em" />
              </button>
            </div>
          ))}
          {comparePets.length === 1 && (
            <div className="compare-bar__placeholder">+ Add one more pet</div>
          )}
        </div>

        <div className="compare-bar__actions">
          {comparePets.length === 2 && (
            <button
              className="compare-bar__btn compare-bar__btn--go"
              onClick={() => navigate("/compare")}
            >
              Compare Now
            </button>
          )}
          <button className="compare-bar__btn compare-bar__btn--clear" onClick={clearCompare}>
            Clear
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
