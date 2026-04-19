import axios from "axios";

// In production the Vercel edge proxies /api/* to the backend (same-origin),
// which avoids Safari ITP blocking cross-site cookies.
// In local dev we hit localhost:8080 directly.
const SERVER_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8080");

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // sends the httpOnly auth cookie automatically on every request
});

export default api;
