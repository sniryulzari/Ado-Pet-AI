import api from "./client";

export const createVisit       = (data)      => api.post("/visits", data);
export const getMyVisits       = ()           => api.get("/visits/my");
export const cancelVisit       = (visitId)   => api.put(`/visits/${visitId}/cancel`);
export const getAllVisits       = ()           => api.get("/visits/all");
export const updateVisitStatus = (visitId, status) => api.put(`/visits/${visitId}/status`, { status });
