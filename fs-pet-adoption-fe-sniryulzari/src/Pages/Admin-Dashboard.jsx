import { useContext, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import PetsList from "../components/Admin-PetList";
import UsersList from "../components/Admin-UserList";
import AdminStats from "../components/Admin-Stats";
import AdminNewsletterList from "../components/Admin-NewsletterList";
import AdminVisitsList from "../components/Admin-VisitsList";
import { UsersContext } from "../Context/Context-Users";
import { PetContext } from "../Context/Context-Pets";
import { getAllUsers, getAllPets, exportPetsCSV, exportUsersCSV } from "../api/admin";
import { toast } from "../utils/toast";

const TABS = ["Overview", "Users", "Pets", "Newsletter", "Visits"];

function downloadCSV(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const AdminDashboard = () => {
  const { setUsers } = useContext(UsersContext);
  const { setPets }  = useContext(PetContext);
  const navigate     = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = type === "pets" ? await exportPetsCSV() : await exportUsersCSV();
      downloadCSV(res.data, `${type}.csv`);
      toast.success(`${type}.csv downloaded!`);
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllUsers(), getAllPets()])
      .then(([usersRes, petsRes]) => {
        setUsers(usersRes.data);
        setPets(petsRes.data);
      })
      .catch(() => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [setPets, setUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner />;

  return (
    <div className="admin-dashboard-pets-container">
      <h1 className="admin-dashboard-header">Admin Dashboard</h1>

      {/* Tab bar */}
      <div className="admin-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`admin-tab-btn${activeTab === tab ? " admin-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === "Overview" && <AdminStats />}

      {activeTab === "Users" && (
        <>
          <div className="admin-pets-table-header-container">
            <h3 className="admin-dashboard-table-header">List of Users</h3>
            <button
              className="admin-export-btn"
              onClick={() => handleExport("users")}
              disabled={exporting === "users"}
            >
              {exporting === "users" ? "Exporting…" : "⬇ Export CSV"}
            </button>
          </div>
          <UsersList />
        </>
      )}

      {activeTab === "Pets" && (
        <>
          <div className="admin-pets-table-header-container">
            <h3 className="admin-dashboard-table-header">List of Pets</h3>
            <div className="admin-pets-actions">
              <button
                className="admin-export-btn"
                onClick={() => handleExport("pets")}
                disabled={exporting === "pets"}
              >
                {exporting === "pets" ? "Exporting…" : "⬇ Export CSV"}
              </button>
              <button className="add-pet-button-link" onClick={() => navigate("/admin-AddPet")}>
                Add Pet
              </button>
            </div>
          </div>
          <PetsList />
        </>
      )}

      {activeTab === "Newsletter" && <AdminNewsletterList />}
      {activeTab === "Visits"     && <AdminVisitsList />}
    </div>
  );
};

export default AdminDashboard;
