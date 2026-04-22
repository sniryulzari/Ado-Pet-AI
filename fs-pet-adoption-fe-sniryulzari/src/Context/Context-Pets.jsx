import { createContext, useState, useCallback, useMemo } from "react";

export const PetContext = createContext();

export function PetsProvider({ children }) {
  // pets — admin list of all pets
  // petId — the id of the pet currently being edited in the admin flow
  const [pets, setPets]           = useState([]);
  const [petId, setPetId]         = useState(null);
  const [comparePets, setComparePets] = useState([]);

  const addToCompare = useCallback((pet) => {
    setComparePets((prev) => {
      if (prev.find((p) => p._id === pet._id)) return prev;
      if (prev.length >= 2) return [prev[1], pet];
      return [...prev, pet];
    });
  }, []);

  const removeFromCompare = useCallback((petId) => {
    setComparePets((prev) => prev.filter((p) => p._id !== petId));
  }, []);

  const clearCompare = useCallback(() => setComparePets([]), []);

  const value = useMemo(
    () => ({
      pets, setPets,
      petId, setPetId,
      comparePets, addToCompare, removeFromCompare, clearCompare,
    }),
    [pets, petId, comparePets, addToCompare, removeFromCompare, clearCompare]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}
