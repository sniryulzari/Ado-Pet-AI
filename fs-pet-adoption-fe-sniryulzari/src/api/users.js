import api from "./client";

export const getUserInfo    = ()            => api.get("/users/userInfo");
export const getMyPets      = ()            => api.get("/users/mypets");
export const login          = (credentials) => api.post("/users/login", credentials);
export const signup         = (userData)    => api.post("/users/signup", userData);
// Changed to POST — logout has a side effect (clears session cookie) so GET is wrong per HTTP spec
export const logout         = ()            => api.post("/users/logout");
export const updateUserInfo = (data)        => api.put("/users/userInfo", data);
export const savePet        = (petId)       => api.put(`/users/${petId}`, {});
export const unsavePet      = (petId)       => api.delete(`/users/${petId}`);
export const adoptPet       = (petId)       => api.put(`/users/adopt/${petId}`, {});
export const fosterPet      = (petId)       => api.put(`/users/foster/${petId}`, {});
export const returnPet      = (petId)       => api.delete(`/users/returnPet/${petId}`);
