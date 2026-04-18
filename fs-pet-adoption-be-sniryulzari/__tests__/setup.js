// Environment variables required by the app — set before any module loads
process.env.TOKEN_SECRET = "test-secret-key-that-is-at-least-32-chars-long!!";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:3000";
