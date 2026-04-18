module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/__tests__/setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "Controllers/**/*.js",
    "Middleware/**/*.js",
    "Models/**/*.js",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "text-summary"],
};
