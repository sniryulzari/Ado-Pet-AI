import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/toast";
import { PetContext } from "../Context/Context-Pets";
import { deletePet } from "../api/admin";

const STATUS_META = {
  Available: { label: "Available", cls: "admin-badge--available" },
  Adopted:   { label: "Adopted",   cls: "admin-badge--adopted"   },
  Fostered:  { label: "Fostered",  cls: "admin-badge--fostered"  },
};

const COLUMNS = [
  { label: "#",                  key: null },
  { label: "Pet",                key: "name" },
  { label: "Type",               key: "type" },
  { label: "Breed",              key: "breed" },
  { label: "Status",             key: "adoptionStatus" },
  { label: "Color",              key: "color" },
  { label: "Hypoallergenic",     key: "hypoallergenic" },
  { label: "Diet",               key: "dietaryRestrictions" },
  { label: "Actions",            key: null },
];

const PetsList = () => {
  const { pets, setPets, setPetId } = useContext(PetContext);
  const navigate = useNavigate();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");

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
    if (!key) return;
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

  const SortIcon = ({ col }) => {
    if (!col || sortKey !== col) return <span className="admin-sort-icon admin-sort-icon--idle">⇅</span>;
    return <span className="admin-sort-icon">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p className="confirm-dialog-text">Are you sure you want to delete this pet?</p>
            <div className="confirm-dialog-buttons">
              <button className="admin-action-btn admin-action-btn--danger" onClick={handleConfirmDelete}>
                Delete
              </button>
              <button className="admin-action-btn admin-action-btn--cancel" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {COLUMNS.map(({ label, key }) => (
                <th
                  key={label}
                  className={key ? "admin-th admin-th--sortable" : "admin-th"}
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {key && <SortIcon col={key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPets.map((pet, index) => {
              const meta = STATUS_META[pet.adoptionStatus] || STATUS_META.Available;
              return (
                <tr key={pet._id} className="admin-row">
                  <td className="admin-td admin-td--num">{index + 1}</td>
                  <td className="admin-td admin-td--pet">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="admin-pet-thumb" />
                    ) : (
                      <div className="admin-pet-thumb admin-pet-thumb--placeholder">🐾</div>
                    )}
                    <span className="admin-pet-name">{pet.name}</span>
                  </td>
                  <td className="admin-td">{pet.type}</td>
                  <td className="admin-td">{pet.breed}</td>
                  <td className="admin-td">
                    <span className={`admin-badge ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="admin-td">{pet.color}</td>
                  <td className="admin-td admin-td--center">{pet.hypoallergenic}</td>
                  <td className="admin-td admin-td--diet">{pet.dietaryRestrictions}</td>
                  <td className="admin-td admin-td--actions">
                    <button
                      className="admin-icon-btn admin-icon-btn--edit"
                      onClick={() => handleEdit(pet._id)}
                      title="Edit pet"
                    >
                      ✏️
                    </button>
                    <button
                      className="admin-icon-btn admin-icon-btn--delete"
                      onClick={() => setConfirmDeleteId(pet._id)}
                      title="Delete pet"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PetsList;
