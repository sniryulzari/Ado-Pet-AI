require("dotenv").config();
const mongoose = require("mongoose");

// Fail fast if required env vars are missing — better than a cryptic runtime crash
const REQUIRED_ENV = ["MONGO_URI", "TOKEN_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Warn loudly if the JWT secret is dangerously short
if (process.env.TOKEN_SECRET.length < 32) {
  console.error("TOKEN_SECRET is too short (minimum 32 characters). Use a long random string.");
  process.exit(1);
}

const PORT = process.env.PORT || 8080;
const app  = require("./app");

mongoose.set("strictQuery", true);

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
