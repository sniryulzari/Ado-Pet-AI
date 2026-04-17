import { useEffect, useState } from "react";
import { MdPets } from "react-icons/md";
import { FaHeart, FaHandHoldingHeart, FaUsers, FaUserPlus, FaEnvelope } from "react-icons/fa";
import { toast } from "../utils/toast";
import { getAdminStats } from "../api/admin";

const PET_TYPE_KEYS = [
  { key: "dogs",     label: "Dogs",     color: "#ff4880" },
  { key: "cats",     label: "Cats",     color: "#393d72" },
  { key: "horses",   label: "Horses",   color: "#ffae00" },
  { key: "tigers",   label: "Tigers",   color: "#e05c00" },
  { key: "dolphins", label: "Dolphins", color: "#00a277" },
];

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <span className="stat-card-icon" style={{ color }}>{icon}</span>
      <span className="stat-card-value">{value ?? "—"}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="stats-loading">Loading stats…</div>;
  }
  if (!stats) return null;

  const totalPets = stats.totalPets || 1; // avoid divide-by-zero for bar widths

  return (
    <div className="admin-stats-section">
      <h2 className="admin-stats-title">Dashboard Overview</h2>

      {/* Stat cards grid */}
      <div className="stat-cards-grid">
        <StatCard icon={<MdPets size="1.6em" />}            value={stats.totalPets}        label="Total Pets"           color="#393d72" />
        <StatCard icon={<MdPets size="1.6em" />}            value={stats.availablePets}    label="Available"            color="#00a277" />
        <StatCard icon={<FaHeart size="1.4em" />}           value={stats.adoptedPets}      label="Adopted"              color="#393d72" />
        <StatCard icon={<FaHandHoldingHeart size="1.4em" />} value={stats.fosteredPets}    label="Fostered"             color="#ffae00" />
        <StatCard icon={<FaUsers size="1.4em" />}           value={stats.totalUsers}       label="Registered Users"     color="#393d72" />
        <StatCard icon={<FaUserPlus size="1.4em" />}        value={stats.newUsersThisMonth} label="New Users This Month" color="#ff4880" />
        <StatCard icon={<FaEnvelope size="1.4em" />}        value={stats.totalSubscribers} label="Newsletter Subscribers" color="#ff4880" />
      </div>

      {/* Pets by type bar */}
      <div className="stats-bar-section">
        <h3 className="stats-bar-title">Pets by Type</h3>
        <div className="stats-bar-list">
          {PET_TYPE_KEYS.map(({ key, label, color }) => {
            const count = stats.petsByType?.[key] ?? 0;
            const pct   = Math.round((count / totalPets) * 100);
            return (
              <div key={key} className="stats-bar-row">
                <span className="stats-bar-label">{label}</span>
                <div className="stats-bar-track">
                  <div
                    className="stats-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="stats-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
