/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Example custom command
// Cypress.Commands.add('login', (email, password) => {
//   cy.visit('/login');
//   cy.get('[data-cy=email]').type(email);
//   cy.get('[data-cy=password]').type(password);
//   cy.get('[data-cy=submit]').click();
// });

// Declare custom commands in TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom command declarations here
      // login(email: string, password: string): Chainable<void>
    }
  }
}

export {};