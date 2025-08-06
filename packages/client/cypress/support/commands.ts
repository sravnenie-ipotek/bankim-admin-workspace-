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

// Custom command to check for content errors
Cypress.Commands.add('checkForContentErrors', () => {
  return cy.get('body').then($body => {
    const bodyText = $body.text();
    const hasError = 
      bodyText.includes('Content item not found') ||
      bodyText.includes('Failed to load') ||
      bodyText.includes('Error') ||
      bodyText.includes('Ошибка') ||
      $body.find('.error-state').length > 0 ||
      $body.find('.shared-edit-error').length > 0 ||
      $body.find('.text-edit-error').length > 0;
    
    return cy.wrap(hasError);
  });
});

// Custom command to navigate to drill page
Cypress.Commands.add('navigateToDrill', (pageIndex: number) => {
  cy.get('.row-view11 .column7 .image8').eq(pageIndex).click();
  cy.url().should('include', '/drill/');
  cy.contains('Список действий на странице').should('be.visible');
});

// ***********************************************
// Admin Portal Navigation Testing Commands
// ***********************************************

// Login command for admin portal
Cypress.Commands.add('loginAdminPortal', () => {
  cy.visit('http://185.253.72.80:3002');
  
  // Wait for page load
  cy.wait(2000);
  
  // Check if login is needed
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="login-form"], .login-form, form[action*="login"]').length > 0) {
      // Try different login selectors
      const emailSelectors = ['[data-cy="email-input"]', 'input[type="email"]', 'input[name="email"]', '#email'];
      const passwordSelectors = ['[data-cy="password-input"]', 'input[type="password"]', 'input[name="password"]', '#password'];
      const submitSelectors = ['[data-cy="login-button"]', 'button[type="submit"]', '.login-button', '.btn-login'];
      
      // Find and fill email
      let emailFound = false;
      emailSelectors.forEach(selector => {
        if (!emailFound && $body.find(selector).length > 0) {
          cy.get(selector).type('admin@bankimonline.com');
          emailFound = true;
        }
      });
      
      // Find and fill password
      let passwordFound = false;
      passwordSelectors.forEach(selector => {
        if (!passwordFound && $body.find(selector).length > 0) {
          cy.get(selector).type('admin123');
          passwordFound = true;
        }
      });
      
      // Find and click submit
      let submitFound = false;
      submitSelectors.forEach(selector => {
        if (!submitFound && $body.find(selector).length > 0) {
          cy.get(selector).click();
          submitFound = true;
        }
      });
      
      if (emailFound && passwordFound && submitFound) {
        cy.wait(3000); // Wait for login to complete
      }
    }
  });
});

// Check for admin portal errors
Cypress.Commands.add('checkAdminPortalErrors', () => {
  return cy.get('body').then(($body) => {
    const errorSelectors = [
      '.error',
      '.error-message', 
      '.alert-error',
      '.alert-danger',
      '.notification-error',
      '[data-cy="error"]',
      '.error-boundary',
      '.error-page'
    ];
    
    let hasError = false;
    let errorMessages: string[] = [];
    
    errorSelectors.forEach(selector => {
      const $elements = $body.find(selector);
      if ($elements.length > 0 && $elements.is(':visible')) {
        hasError = true;
        $elements.each((_, element) => {
          const text = Cypress.$(element).text().trim();
          if (text) {
            errorMessages.push(text);
          }
        });
      }
    });
    
    // Check for 404 or error page indicators
    const errorPageIndicators = [
      '404',
      'Not Found',
      'Страница не найдена',
      'Ошибка',
      'Error',
      'Something went wrong'
    ];
    
    errorPageIndicators.forEach(indicator => {
      if ($body.find(`:contains("${indicator}")`).length > 0) {
        const context = $body.find(`:contains("${indicator}")`).first().text().trim();
        if (context.length < 200) { // Avoid capturing entire page content
          hasError = true;
          errorMessages.push(`Page error: ${context}`);
        }
      }
    });
    
    // Check for development placeholder (this is expected and OK)
    const isDevelopmentPage = $body.find(':contains("В разработке")').length > 0 ||
                            $body.find(':contains("Phase 2")').length > 0 ||
                            $body.find('.in-development').length > 0;
    
    return { hasError, errorMessages, isDevelopmentPage };
  });
});

// Capture console errors for reporting
Cypress.Commands.add('captureConsoleErrors', () => {
  cy.window().then((win) => {
    const errors: string[] = [];
    
    // Override console.error to capture errors
    const originalError = win.console.error;
    win.console.error = (...args: any[]) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    // Store errors on window for later access
    (win as any).__cypressConsoleErrors = errors;
  });
});

// Skip content management navigation
Cypress.Commands.add('isContentManagementLink', (element: JQuery<HTMLElement>) => {
  const text = element.text().toLowerCase();
  const href = element.attr('href')?.toLowerCase() || '';
  const className = element.attr('class')?.toLowerCase() || '';
  
  const contentKeywords = [
    'контент',
    'content',
    'содержимое',
    'материалы',
    'content-',
    'cms'
  ];
  
  return contentKeywords.some(keyword =>
    text.includes(keyword) ||
    href.includes(keyword) ||
    className.includes(keyword)
  );
});

// Declare custom commands in TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      fillHebrewField(fieldName: string, value: string): Chainable<void>;
      handleSmsVerification(code: string): Chainable<void>;
      waitForHebrewElement(text: string): Chainable<void>;
      checkForContentErrors(): Chainable<boolean>;
      navigateToDrill(pageIndex: number): Chainable<void>;
      loginAdminPortal(): Chainable<void>;
      checkAdminPortalErrors(): Chainable<{hasError: boolean, errorMessages: string[], isDevelopmentPage: boolean}>;
      captureConsoleErrors(): Chainable<void>;
      isContentManagementLink(element: JQuery<HTMLElement>): boolean;
    }
  }
}

export {};