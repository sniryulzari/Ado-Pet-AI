const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Fail fast if required env vars are missing — better than a cryptic runtime crash
const REQUIRED_ENV = ["MONGO_URI", "TOKEN_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 8080;

// Frontend origin — the server allows requests from here (not from itself)
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://pet-adoption-133f.onrender.com"
    : "http://localhost:3000";

const app = express();

// Security headers (X-Frame-Options, X-Content-Type-Options, removes X-Powered-By, etc.)
app.use(helmet());

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// 50 kb limit prevents large-payload DoS attacks
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use("/images", express.static("Images"));

const usersRoute = require("./Routes/UsersRoute");
const petsRoute = require("./Routes/PetsRoute");
const adminRoute = require("./Routes/AdminRoute");
const appOperationsRoute = require("./Routes/AppOperationsRoute");
const newsletterRoute = require("./Routes/NewsletterRoute");

app.use("/users", usersRoute);
app.use("/pets", petsRoute);
app.use("/admin", adminRoute);
app.use("/appOperations", appOperationsRoute);
app.use("/newsletter", newsletterRoute);

mongoose.set("strictQuery", true);

// Health check — used by Render and load balancers to verify the server is up
app.get("/health", (_req, res) => res.sendStatus(200));

// Global error handler — catches any error passed to next(err)
// Must be defined AFTER all routes
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Connected to db");
    }
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`App is listening on port: ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
