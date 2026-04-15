import axios from "axios";

// Single source of truth for the backend URL.
// Previously getServerUrl() was a function re-created on every App render and
// passed through both contexts, causing unnecessary re-renders in all consumers.
const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://pet-adoption-bbvp.onrender.com"  // backend URL (was incorrectly the frontend URL)
    : "http://localhost:8080";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // sends the httpOnly auth cookie automatically on every request
});

export default api;
