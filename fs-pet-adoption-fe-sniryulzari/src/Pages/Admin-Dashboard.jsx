import { useContext, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import PetsList from "../components/Admin-PetList";
import UsersList from "../components/Admin-UserList";
import { UsersContext } from "../Context/Context-Users";
import { PetContext } from "../Context/Context-Pets";
import { getAllUsers, getAllPets } from "../api/admin";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { setUsers } = useContext(UsersContext);
  const { setPets }  = useContext(PetContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
      <h3 className="admin-dashboard-table-header">List of Users</h3>
      <UsersList />

      <div className="admin-pets-table-header-container">
        <h3 className="admin-dashboard-table-header">List of Pets</h3>
        <button className="add-pet-button-link" onClick={() => navigate("/admin-AddPet")}>
          Add Pet
        </button>
      </div>
      <PetsList />
    </div>
  );
};

export default AdminDashboard;
