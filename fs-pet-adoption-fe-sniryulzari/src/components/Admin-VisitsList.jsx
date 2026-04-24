import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaHourglass } from "react-icons/fa";
import { getAllVisits, updateVisitStatus } from "../api/visits";
import { toast } from "../utils/toast";

const STATUS_META = {
  pending:   { icon: <FaHourglass  />, cls: "visit-status--pending"   },
  confirmed: { icon: <FaCheckCircle />, cls: "visit-status--confirmed" },
  cancelled: { icon: <FaTimesCircle />, cls: "visit-status--cancelled" },
};

export default function AdminVisitsList() {
  const [visits, setVisits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    getAllVisits()
      .then((res) => setVisits(res.data))
      .catch(() => toast.error("Failed to load visits."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (visitId, status) => {
    try {
      const res = await updateVisitStatus(visitId, status);
      setVisits((prev) => prev.map((v) => (v._id === visitId ? res.data : v)));
      toast.success(`Visit ${status}.`);
    } catch {
      toast.error("Failed to update visit.");
    }
  };

  const displayed = filter === "all" ? visits : visits.filter((v) => v.status === filter);

  if (loading) return <div className="stats-loading">Loading visits…</div>;

  return (
    <div className="admin-visits-section">
      <div className="admin-visits-header">
        <h3 className="admin-dashboard-table-header">Scheduled Visits ({visits.length})</h3>
        <div className="admin-visits-filter">
          {["all", "pending", "confirmed", "cancelled"].map((f) => (
            <button
              key={f}
              className={`admin-filter-btn${filter === f ? " admin-filter-btn--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <p className="admin-visits-empty">No visits found.</p>
      ) : (
        <div className="admin-visits-table-wrap">
          <table className="admin-visits-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>User</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((v) => {
                const meta = STATUS_META[v.status] || STATUS_META.pending;
                const user = v.userId;
                const pet  = v.petId;
                return (
                  <tr key={v._id}>
                    <td className="admin-visits-pet">
                      {pet ? (
                        <Link to={`/petcard?petId=${pet._id}`} className="admin-visits-pet-link">
                          {pet.imageUrl && <img src={pet.imageUrl} alt={pet.name} className="admin-visits-pet-img" />}
                          <span>{pet.name}</span>
                        </Link>
                      ) : "—"}
                    </td>
                    <td>
                      {user ? (
                        <button className="admin-visits-user-btn" onClick={() => navigate("/admin-UserDetail", { state: { user } })}>
                          {user.firstName} {user.lastName}<br /><small>{user.email}</small>
                        </button>
                      ) : "—"}
                    </td>
                    <td>{v.date}</td>
                    <td>{v.timeSlot}</td>
                    <td className="admin-visits-notes">{v.notes || "—"}</td>
                    <td>
                      <span className={`visit-card__status ${meta.cls}`}>{meta.icon} {v.status}</span>
                    </td>
                    <td>
                      {v.status !== "cancelled" && (
                        <div className="admin-visits-actions">
                          {v.status === "pending" && (
                            <button className="admin-visit-confirm-btn" onClick={() => handleStatus(v._id, "confirmed")}>Confirm</button>
                          )}
                          <button className="admin-visit-cancel-btn" onClick={() => handleStatus(v._id, "cancelled")}>Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
