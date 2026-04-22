import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDog, FaCat, FaHorse, FaPaw } from "react-icons/fa";
import { GiDolphin, GiTigerHead } from "react-icons/gi";

const TYPES = [
  { label: "All Pets",  icon: FaPaw,        type: ""        },
  { label: "Dogs",      icon: FaDog,        type: "Dog"     },
  { label: "Cats",      icon: FaCat,        type: "Cat"     },
  { label: "Horses",    icon: FaHorse,      type: "Horse"   },
  { label: "Dolphins",  icon: GiDolphin,    type: "Dolphin" },
  { label: "Tigers",    icon: GiTigerHead,  type: "Tiger"   },
];

export default function HomeTypeFilter() {
  const navigate = useNavigate();

  function handleClick(type) {
    const params = type ? `?type=${type}` : "";
    navigate(`/search${params}`);
  }

  return (
    <section className="type-filter-section">
      <h2 className="type-filter-heading">Browse by Type</h2>
      <div className="type-filter-grid">
        {TYPES.map(({ label, icon: Icon, type }, i) => (
          <motion.button
            key={label}
            className="type-filter-card"
            onClick={() => handleClick(type)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -6, boxShadow: "0 8px 24px rgba(255,72,128,0.25)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="type-filter-icon" aria-hidden="true" />
            <span className="type-filter-label">{label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
