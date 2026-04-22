import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaBalanceScale } from "react-icons/fa";
import { motion } from "framer-motion";
import { PetContext } from "../Context/Context-Pets";

function statusBadge(status) {
  if (status === "Available") return <span className="pet-badge pet-badge--available">{status}</span>;
  if (status === "Adopted")   return <span className="pet-badge pet-badge--adopted">{status}</span>;
  return <span className="pet-badge pet-badge--fostered">{status}</span>;
}

function BoolCell({ value }) {
  const yes = value === true || String(value).toLowerCase() === "yes" || String(value).toLowerCase() === "true";
  return yes
    ? <span className="compare-bool compare-bool--yes"><FaCheckCircle /> Yes</span>
    : <span className="compare-bool compare-bool--no"><FaTimesCircle /> No</span>;
}

const ROWS = [
  { label: "Type",                   key: "type" },
  { label: "Breed",                  key: "breed" },
  { label: "Status",                 key: "adoptionStatus", render: (v) => statusBadge(v) },
  { label: "Height",                 key: "height",         render: (v) => `${v} cm` },
  { label: "Weight",                 key: "weight",         render: (v) => `${v} kg` },
  { label: "Color",                  key: "color" },
  { label: "Hypoallergenic",         key: "hypoallergenic", render: (v) => <BoolCell value={v} /> },
  { label: "Dietary Restrictions",   key: "dietaryRestrictions" },
];

export default function Compare() {
  const { comparePets, clearCompare } = useContext(PetContext);
  const navigate = useNavigate();

  if (comparePets.length < 2) {
    return (
      <div className="compare-page compare-page--empty">
        <FaBalanceScale size="3em" className="compare-empty-icon" />
        <h2>Select 2 pets to compare</h2>
        <p>Browse pets and click "Compare" on any pet card or pet detail page.</p>
        <button className="rec-login-btn" onClick={() => navigate("/search")}>Browse Pets</button>
      </div>
    );
  }

  const [petA, petB] = comparePets;

  return (
    <div className="compare-page">
      <motion.div
        className="compare-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="compare-title"><FaBalanceScale className="compare-title__icon" /> Side-by-Side Comparison</h1>
        <button className="compare-clear-btn" onClick={() => { clearCompare(); navigate("/search"); }}>
          Start Over
        </button>
      </motion.div>

      <div className="compare-cards">
        {[petA, petB].map((pet, idx) => (
          <motion.div
            key={pet._id}
            className="compare-pet-col"
            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="compare-pet-img-wrap">
              <img src={pet.imageUrl} alt={pet.name} className="compare-pet-img" />
              <div className="compare-pet-img-overlay">
                <span className="compare-pet-name">{pet.name}</span>
              </div>
            </div>
            <button
              className="compare-visit-btn"
              onClick={() => navigate(`/petcard?petId=${pet._id}`)}
            >
              View {pet.name} →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="compare-table">
        {ROWS.map(({ label, key, render }) => {
          const valA = petA[key];
          const valB = petB[key];
          const same = String(valA).toLowerCase() === String(valB).toLowerCase();
          return (
            <div key={key} className={`compare-row${same ? " compare-row--same" : ""}`}>
              <span className="compare-row__label">{label}</span>
              <span className="compare-row__val">{render ? render(valA) : valA}</span>
              <span className="compare-row__val">{render ? render(valB) : valB}</span>
            </div>
          );
        })}
      </div>

      <div className="compare-bios">
        {[petA, petB].map((pet) => (
          <div key={pet._id} className="compare-bio-col">
            <h4 className="compare-bio-title">About {pet.name}</h4>
            <p className="compare-bio-text">{pet.bio || "No bio available."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
