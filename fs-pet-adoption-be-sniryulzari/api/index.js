/**
 * Vercel Serverless entry point.
 *
 * Wraps the Express app so Vercel can invoke it as a serverless function.
 * The key challenge is MongoDB: mongoose.connect() is async and expensive, so
 * we cache the promise across invocations — a new TCP connection is only opened
 * on a cold start, not on every request.
 */

const mongoose = require("mongoose");

let connectionPromise = null;

function connectDB() {
  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
  }
  return connectionPromise;
}

const app = require("../app");

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
