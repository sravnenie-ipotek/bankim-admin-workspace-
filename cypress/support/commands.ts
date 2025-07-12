/// <reference types="cypress" />
import { getHebrewFieldSelector } from './mortgage-helpers';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for filling Hebrew fields
Cypress.Commands.add('fillHebrewField', (fieldName: string, value: string) => {
  const selector = getHebrewFieldSelector(fieldName);
  cy.get(selector)
    .first()
    .should('be.visible')
    .click()
    .clear()
    .type(value, { delay: 50 });
});

// Custom command for handling SMS verification
Cypress.Commands.add('handleSmsVerification', (code: string) => {
  cy.get('body').then($body => {
    // Check multiple possible selectors for SMS input
    const smsSelectors = [
      'input[placeholder*="קוד"]',
      'input[placeholder*="SMS"]',
      'input[placeholder*="אימות"]',
      'input[name="smsCode"]',
      'input[name="verificationCode"]',
      'input[type="text"][maxlength="6"]'
    ];

    for (const selector of smsSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector)
          .should('be.visible')
          .clear()
          .type(code);
        
        // Click verify button
        cy.get('button').contains(/אמת|אישור|המשך|verify|confirm|continue/i)
          .first()
          .click();
        
        break;
      }
    }
  });
});

// Custom command for waiting for page elements in Hebrew
Cypress.Commands.add('waitForHebrewElement', (text: string) => {
  cy.contains(new RegExp(text, 'i')).should('be.visible');
});

// Declare custom commands in TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      fillHebrewField(fieldName: string, value: string): Chainable<void>;
      handleSmsVerification(code: string): Chainable<void>;
      waitForHebrewElement(text: string): Chainable<void>;
    }
  }
}

export {};