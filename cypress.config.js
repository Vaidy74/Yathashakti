const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 6000
  },
  env: {
    // Environment variables for tests
    apiUrl: "http://localhost:3000/api",
    testUserEmail: "test@example.com",
    testUserPassword: "Password123!",
  },
});
