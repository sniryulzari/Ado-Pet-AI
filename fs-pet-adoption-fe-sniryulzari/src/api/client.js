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

// Queue of requests that arrived while a token refresh was in flight
let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s; skip the refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url === "/users/refresh"
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait for the in-flight refresh, then retry this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(original))
        .catch((e) => Promise.reject(e));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post("/users/refresh");
      processQueue(null);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      // Notify the app that the session has expired so the UI can clear auth state
      window.dispatchEvent(new Event("auth:session-expired"));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
