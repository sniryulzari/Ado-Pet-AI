import api from "./client";

export const sendContactMessage = (data) => api.post("/contact/send", data);
