// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// Disable uncaught exception handling to prevent tests from failing
// due to application errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error but don't fail the test
  console.error('Uncaught exception:', err.message);
  
  // Return false to prevent the error from failing the test
  // unless it's a critical error we want to catch
  if (err.message.includes('Content item not found')) {
    return true; // Let this error fail the test
  }
  
  return false;
});

// Add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Check if the current page has content errors
       */
      checkForContentErrors(): Chainable<boolean>;
      
      /**
       * Navigate to a mortgage drill page
       */
      navigateToDrill(pageIndex: number): Chainable<void>;
    }
  }
}

// Export empty object to make this a module
export {};