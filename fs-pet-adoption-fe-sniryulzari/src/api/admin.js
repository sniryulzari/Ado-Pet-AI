import api from "./client";

export const getAllPets  = ()         => api.get("/admin/all");
export const getAllUsers = ()         => api.get("/admin/allusers");
export const getPetById = (petId)    => api.get(`/admin/${petId}`);
export const addPet     = (formData) => api.post("/admin/add", formData);
export const editPet    = (formData) => api.put("/admin/editpet", formData);
export const deletePet  = (petId)    => api.delete(`/admin/${petId}`);
