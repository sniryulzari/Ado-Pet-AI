import axios from "axios";

// Single source of truth for the backend URL.
// In production (Vercel) set REACT_APP_API_URL to your Railway backend URL.
// CRA bakes REACT_APP_* vars into the bundle at build time, so the value must
// be set in the Vercel environment variables dashboard before building.
const SERVER_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // sends the httpOnly auth cookie automatically on every request
});

export default api;
