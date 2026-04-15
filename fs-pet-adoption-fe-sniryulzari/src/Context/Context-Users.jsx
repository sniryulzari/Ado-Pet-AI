import { createContext, useState, useEffect, useMemo } from "react";
import { getUserInfo } from "../api/users";

export const UsersContext = createContext();

// State that was previously crammed into App.js now lives here.
// App.js becomes a pure layout/router component with no state.
export function UsersProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  // authChecked starts false. Protected routes must wait for it to be true
  // before deciding to redirect — otherwise they redirect during the brief
  // window while getUserInfo() is still in-flight on page load.
  const [authChecked, setAuthChecked] = useState(false);
  // users and userPets are admin-specific — kept here so admin components
  // can read them from context without prop drilling
  const [users, setUsers]           = useState([]);
  const [userPets, setUserPets]     = useState({});

  // Run once on mount to restore auth state from the httpOnly cookie.
  useEffect(() => {
    getUserInfo()
      .then((res) => {
        console.log("[AuthCheck] getUserInfo response:", res.data);
        if (res.data?._id) {
          setIsLoggedIn(true);
          setIsAdmin(res.data.isAdmin === true);
          setFirstName(res.data.firstName || "");
          setLastName(res.data.lastName || "");
        }
      })
      .catch(() => {
        // Not logged in — leave defaults (false / "")
      })
      .finally(() => {
        // Auth check is done (whether it succeeded or failed).
        // Routes can now safely evaluate isLoggedIn / isAdmin.
        setAuthChecked(true);
      });
  }, []);

  // useMemo prevents a new object reference on every render.
  // Without this, every context consumer re-renders whenever any ancestor renders,
  // even if none of the values inside the context actually changed.
  const value = useMemo(
    () => ({
      isLoggedIn, setIsLoggedIn,
      isAdmin,    setIsAdmin,
      authChecked,
      firstName,  setFirstName,
      lastName,   setLastName,
      users,      setUsers,
      userPets,   setUserPets,
    }),
    [isLoggedIn, isAdmin, authChecked, firstName, lastName, users, userPets]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
