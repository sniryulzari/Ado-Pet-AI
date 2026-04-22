import { createContext, useState, useEffect, useMemo } from "react";
import { getUserInfo, savePet, unsavePet } from "../api/users";

export const UsersContext = createContext();

// State that was previously crammed into App.js now lives here.
// App.js becomes a pure layout/router component with no state.
export function UsersProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [profileImage, setProfileImage] = useState("");
  // authChecked starts false. Protected routes must wait for it to be true
  // before deciding to redirect — otherwise they redirect during the brief
  // window while getUserInfo() is still in-flight on page load.
  const [authChecked, setAuthChecked] = useState(false);
  // savedPetIds: set of pet IDs the current user has saved, for heart-icon state
  const [savedPetIds, setSavedPetIds] = useState(new Set());
  // users and userPets are admin-specific — kept here so admin components
  // can read them from context without prop drilling
  const [users, setUsers]           = useState([]);
  const [userPets, setUserPets]     = useState({});

  function clearAuthState() {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setFirstName("");
    setLastName("");
    setProfileImage("");
    setSavedPetIds(new Set());
  }

  // Run once on mount to restore auth state from the httpOnly cookie.
  useEffect(() => {
    getUserInfo()
      .then((res) => {
        if (res.data?._id) {
          setIsLoggedIn(true);
          setIsAdmin(res.data.isAdmin === true);
          setFirstName(res.data.firstName || "");
          setLastName(res.data.lastName || "");
          setProfileImage(res.data.profileImage || "");
          setSavedPetIds(new Set(res.data.savedPet || []));
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

  // When the axios interceptor exhausts both the access token and the refresh
  // token it fires this event. Clear UI auth state so protected routes redirect.
  useEffect(() => {
    window.addEventListener("auth:session-expired", clearAuthState);
    return () => window.removeEventListener("auth:session-expired", clearAuthState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle a pet's saved state globally; avoids prop-drilling into every card.
  async function toggleSavedPet(petId) {
    const isSaved = savedPetIds.has(petId);
    try {
      if (isSaved) {
        await unsavePet(petId);
        setSavedPetIds((prev) => { const next = new Set(prev); next.delete(petId); return next; });
      } else {
        await savePet(petId);
        setSavedPetIds((prev) => new Set([...prev, petId]));
      }
    } catch {
      throw new Error("Failed to update saved pets");
    }
  }

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
      profileImage, setProfileImage,
      savedPetIds, setSavedPetIds,
      toggleSavedPet,
      users,      setUsers,
      userPets,   setUserPets,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoggedIn, isAdmin, authChecked, firstName, lastName, profileImage, savedPetIds, users, userPets]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
