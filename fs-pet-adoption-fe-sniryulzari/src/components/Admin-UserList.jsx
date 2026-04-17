import React, { useContext, useState } from "react";
import { UsersContext } from "../Context/Context-Users";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
  { label: "#",           key: null },
  { label: "Name",        key: "firstName" },
  { label: "Email",       key: "email" },
  { label: "Phone",       key: "phoneNumber" },
  { label: "Bio",         key: "bio" },
  { label: "Pets",        key: null },
];

const UsersList = () => {
  const { users, setUserPets } = useContext(UsersContext);
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleUserPets = (user) => {
    setUserPets(user);
    navigate("/admin-UserPets");
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

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }) => {
    if (!col || sortKey !== col) return <span className="admin-sort-icon admin-sort-icon--idle">⇅</span>;
    return <span className="admin-sort-icon">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  return (
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
          {sortedUsers.map((user, index) => (
            <tr key={user._id} className="admin-row">
              <td className="admin-td admin-td--num">{index + 1}</td>
              <td className="admin-td admin-td--user">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.firstName} className="admin-user-avatar" />
                ) : (
                  <div className="admin-user-avatar admin-user-avatar--placeholder">
                    {user.firstName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="admin-user-name">{user.firstName} {user.lastName}</span>
              </td>
              <td className="admin-td">{user.email}</td>
              <td className="admin-td">{user.phoneNumber}</td>
              <td className="admin-td admin-td--bio">{user.bio}</td>
              <td className="admin-td admin-td--actions">
                <button
                  className="admin-icon-btn admin-icon-btn--view"
                  onClick={() => handleUserPets(user)}
                  title="View pets"
                >
                  🐾
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
