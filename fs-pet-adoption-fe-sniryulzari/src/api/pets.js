import api from "./client";

export const searchPets       = (params) => api.get("/pets/search", { params });
export const getPetById       = (petId)  => api.get(`/pets/${petId}`);
export const adoptPetStatus   = (data)   => api.put("/pets/adopt", data);
export const fosterPetStatus  = (data)   => api.put("/pets/foster", data);
export const returnPetStatus  = (data)   => api.put("/pets/returnPet", data);
export const getSavedPetInfo  = (petId)  => api.get(`/pets/mySavedPets/${petId}`);
export const getAdoptedPetInfo  = (petId) => api.get(`/pets/myAdoptedPets/${petId}`);
export const getFosteredPetInfo = (petId) => api.get(`/pets/myFosteredPets/${petId}`);
export const getPetOfTheWeek   = ()       => api.get("/appOperations/weeklyPet");
