import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4002',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      let logs: any[] = [];
      
      on('task', {
        log(entry) {
          logs.push(entry);
          return null;
        },
        getLogs() {
          return logs;
        },
        clearLogs() {
          logs = [];
          return null;
        }
      });
      
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0
    },
  },
});