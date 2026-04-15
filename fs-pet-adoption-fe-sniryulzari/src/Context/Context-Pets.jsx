import { createContext, useState, useMemo } from "react";

export const PetContext = createContext();

export function PetsProvider({ children }) {
  // pets — admin list of all pets
  // petId — the id of the pet currently being edited in the admin flow
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState(null);

  const value = useMemo(
    () => ({
      pets, setPets,
      petId, setPetId,
    }),
    [pets, petId]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}
