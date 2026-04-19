/**
 * app.js — Express application factory.
 *
 * Deliberately separated from server.js so the app can be imported by
 * supertest integration tests without triggering the MongoDB connection
 * or the process.exit() environment-variable checks that belong in the
 * entry point (server.js).
 */

const express     = require("express");
const helmet      = require("helmet");
const cors        = require("cors");
const cookieParser = require("cookie-parser");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();

// Security headers (X-Frame-Options, X-Content-Type-Options, removes X-Powered-By, etc.)
app.use(helmet());

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// 50 kb limit prevents large-payload DoS attacks
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use("/images", express.static("Images"));

// Routes
app.use("/users",         require("./Routes/UsersRoute"));
app.use("/pets",          require("./Routes/PetsRoute"));
app.use("/admin",         require("./Routes/AdminRoute"));
app.use("/appOperations", require("./Routes/AppOperationsRoute"));
app.use("/newsletter",    require("./Routes/NewsletterRoute"));
app.use("/contact",       require("./Routes/ContactRoute"));
app.use("/share",         require("./Routes/ShareRoute"));

// Health check — used by Render and load balancers to verify the server is up
app.get("/health", (_req, res) => res.sendStatus(200));

// Global error handler — must be defined AFTER all routes
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
