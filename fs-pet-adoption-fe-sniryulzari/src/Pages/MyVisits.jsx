import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglass } from "react-icons/fa";
import { motion } from "framer-motion";
import { getMyVisits, cancelVisit } from "../api/visits";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

const STATUS_META = {
  pending:   { icon: <FaHourglass  />, label: "Pending",   cls: "visit-status--pending"   },
  confirmed: { icon: <FaCheckCircle />, label: "Confirmed", cls: "visit-status--confirmed" },
  cancelled: { icon: <FaTimesCircle />, label: "Cancelled", cls: "visit-status--cancelled" },
};

export default function MyVisits() {
  const [visits, setVisits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    getMyVisits()
      .then((res) => setVisits(res.data))
      .catch(() => toast.error("Failed to load visits."))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (visitId) => {
    try {
      const res = await cancelVisit(visitId);
      setVisits((prev) => prev.map((v) => (v._id === visitId ? res.data : v)));
      toast.success("Visit cancelled.");
    } catch {
      toast.error("Failed to cancel visit.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="my-visits-page">
      <motion.div
        className="my-visits-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="my-visits-title">
          <FaCalendarAlt className="my-visits-title__icon" /> My Visits
        </h1>
        <p className="my-visits-subtitle">Track your scheduled shelter visits</p>
      </motion.div>

      {visits.length === 0 ? (
        <div className="my-visits-empty">
          <span style={{ fontSize: "3.5rem" }}>🐾</span>
          <h3>No visits scheduled yet</h3>
          <p>Browse pets and click "Schedule a Visit" to book a time.</p>
          <button className="rec-login-btn" onClick={() => navigate("/search")}>Browse Pets</button>
        </div>
      ) : (
        <div className="my-visits-list">
          {visits.map((visit, i) => {
            const meta  = STATUS_META[visit.status] || STATUS_META.pending;
            const pet   = visit.petId;
            return (
              <motion.div
                key={visit._id}
                className="visit-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {pet?.imageUrl && (
                  <img
                    src={pet.imageUrl}
                    alt={pet?.name}
                    className="visit-card__img"
                    onClick={() => navigate(`/petcard?petId=${pet._id}`)}
                  />
                )}
                <div className="visit-card__body">
                  <div className="visit-card__top">
                    <h3
                      className="visit-card__pet-name"
                      onClick={() => navigate(`/petcard?petId=${pet?._id}`)}
                    >
                      {pet?.name || "Pet"}
                    </h3>
                    <span className={`visit-card__status ${meta.cls}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <p className="visit-card__breed">{[pet?.type, pet?.breed].filter(Boolean).join(" · ")}</p>
                  <div className="visit-card__details">
                    <span><FaCalendarAlt size="0.8em" /> {visit.date}</span>
                    <span><FaClock size="0.8em" /> {visit.timeSlot}</span>
                  </div>
                  {visit.notes && <p className="visit-card__notes">"{visit.notes}"</p>}
                  {visit.status === "pending" && (
                    <button className="visit-card__cancel-btn" onClick={() => handleCancel(visit._id)}>
                      Cancel Visit
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
