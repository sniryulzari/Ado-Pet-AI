import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import { GrEdit } from "react-icons/gr";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { PetContext } from "../Context/Context-Pets";
import { deletePet } from "../api/admin";

const COLUMNS = [
  { label: "Type",                 key: "type" },
  { label: "Breed",                key: "breed" },
  { label: "Name",                 key: "name" },
  { label: "Adoption Status",      key: "adoptionStatus" },
  { label: "Color",                key: "color" },
  { label: "Hypoallergenic",       key: "hypoallergenic" },
  { label: "Dietary Restrictions", key: "dietaryRestrictions" },
];

const PetsList = () => {
  const { pets, setPets, setPetId } = useContext(PetContext);
  const navigate = useNavigate();

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Sorting
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleEdit = (petId) => {
    setPetId(petId);
    navigate("/admin-EditPet");
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePet(confirmDeleteId);
      setPets((prev) => prev.filter((p) => p._id !== confirmDeleteId));
      toast.success("Pet deleted.");
    } catch {
      toast.error("Failed to delete pet.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedPets = [...pets].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIndicator = ({ col }) => {
    if (sortKey !== col) return null;
    return <span style={{ marginLeft: "0.3rem" }}>{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <>
      {confirmDeleteId && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p className="confirm-dialog-text">
              האם אתה בטוח שאתה רוצה למחוק את החיה?
            </p>
            <div className="confirm-dialog-buttons">
              <button className="add-pet-buttons" onClick={handleConfirmDelete}>
                מחק
              </button>
              <button
                className="add-pet-buttons"
                style={{ background: "#fff", color: "#ff4880", border: "1px solid #ff4880" }}
                onClick={() => setConfirmDeleteId(null)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pets-list">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="text-center">#</th>
              {COLUMNS.map(({ label, key }) => (
                <th
                  key={key}
                  className="text-center sortable-header"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  <SortIndicator col={key} />
                </th>
              ))}
              <th className="text-center">Edit</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sortedPets.map((pet, index) => (
              <tr key={pet._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{pet.type}</td>
                <td className="text-center">{pet.breed}</td>
                <td className="text-center">{pet.name}</td>
                <td className="text-center">{pet.adoptionStatus}</td>
                <td className="text-center">{pet.color}</td>
                <td className="text-center">{pet.hypoallergenic}</td>
                <td className="text-center">{pet.dietaryRestrictions}</td>
                <td className="text-center">
                  <GrEdit className="edit-icon" size="1.1em" onClick={() => handleEdit(pet._id)} />
                </td>
                <td className="text-center">
                  <AiOutlineDelete className="edit-icon" size="1.3em" onClick={() => setConfirmDeleteId(pet._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default PetsList;
