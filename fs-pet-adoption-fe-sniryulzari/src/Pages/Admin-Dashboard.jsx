import { useContext, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import PetsList from "../components/Admin-PetList";
import UsersList from "../components/Admin-UserList";
import AdminStats from "../components/Admin-Stats";
import AdminNewsletterList from "../components/Admin-NewsletterList";
import { UsersContext } from "../Context/Context-Users";
import { PetContext } from "../Context/Context-Pets";
import { getAllUsers, getAllPets } from "../api/admin";
import { toast } from "../utils/toast";

const TABS = ["Overview", "Users", "Pets", "Newsletter"];

const AdminDashboard = () => {
  const { setUsers } = useContext(UsersContext);
  const { setPets }  = useContext(PetContext);
  const navigate     = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllUsers(), getAllPets()])
      .then(([usersRes, petsRes]) => {
        setUsers(usersRes.data);
        setPets(petsRes.data);
      })
      .catch(() => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

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
          <h3 className="admin-dashboard-table-header">List of Users</h3>
          <UsersList />
        </>
      )}

      {activeTab === "Pets" && (
        <>
          <div className="admin-pets-table-header-container">
            <h3 className="admin-dashboard-table-header">List of Pets</h3>
            <button className="add-pet-button-link" onClick={() => navigate("/admin-AddPet")}>
              Add Pet
            </button>
          </div>
          <PetsList />
        </>
      )}

      {activeTab === "Newsletter" && <AdminNewsletterList />}
    </div>
  );
};

export default AdminDashboard;
