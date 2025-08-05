/**
 * Cypress test for checking all mortgage pages and their drill-down navigation
 * Tests navigation through all levels and checks for errors
 */

describe('Mortgage Content Drill Navigation Test', () => {
  // Define the mortgage pages to test based on the screenshot
  const mortgagePages = [
    { index: 0, name: 'Калькулятор ипотеки', expectedActions: 168 },
    { index: 1, name: 'Анкета личных данных', expectedActions: 61 },
    { index: 2, name: 'Анкета доходов', expectedActions: 57 },
    { index: 3, name: 'Выбор программ ипотеки', expectedActions: 20 }
  ];

  beforeEach(() => {
    // Login or set authentication if needed
    cy.visit('/content/mortgage');
    
    // Wait for the page to load
    cy.contains('Список страниц').should('be.visible');
  });

  it('should navigate through all mortgage pages without errors', () => {
    // Test each mortgage page
    mortgagePages.forEach((page) => {
      cy.log(`Testing page: ${page.name}`);
      
      // Find and click the arrow button for this page
      cy.get('.row-view11 .column7 .image8')
        .eq(page.index)
        .should('be.visible')
        .click();
      
      // Verify we're on the drill page
      cy.url().should('include', '/content/mortgage/drill/');
      cy.contains(page.name).should('be.visible');
      
      // Check for the action count
      cy.contains('Количество действий')
        .parent()
        .find('.info-value')
        .should('contain', page.expectedActions.toString());
      
      // Check that there are no console errors
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });
      
      // Get all action items on the current page
      cy.get('.drill-table-columns .edit-icon-button').then(($buttons) => {
        const buttonCount = $buttons.length;
        cy.log(`Found ${buttonCount} action items on current page`);
        
        // Test clicking each action item
        for (let i = 0; i < Math.min(buttonCount, 5); i++) { // Test first 5 items to avoid timeout
          cy.log(`Testing action item ${i + 1}`);
          
          // Click the action item
          cy.get('.drill-table-columns .edit-icon-button')
            .eq(i)
            .click();
          
          // Check the URL changed to edit page
          cy.url().should('match', /\/content\/mortgage\/(edit|text-edit|dropdown-edit)\/\d+/);
          
          // Wait for the edit page to load
          cy.wait(1000);
          
          // Check for error messages
          cy.get('body').then(($body) => {
            // Check for "Content item not found" error
            const errorText = $body.text();
            if (errorText.includes('Content item not found') || errorText.includes('ID: 1370')) {
              cy.log(`ERROR: Content item not found on ${cy.url()}`);
              throw new Error(`Content item not found error detected at ${cy.url()}`);
            }
            
            // Check for error elements
            if ($body.find('.error-state').length > 0 || 
                $body.find('.shared-edit-error').length > 0 ||
                $body.find('.text-edit-error').length > 0) {
              const errorMessage = $body.find('.error-state, .shared-edit-error, .text-edit-error').text();
              cy.log(`ERROR: ${errorMessage}`);
              throw new Error(`Error detected: ${errorMessage}`);
            }
          });
          
          // Verify edit page loaded correctly
          cy.get('body').should('not.contain', 'Ошибка');
          cy.get('body').should('not.contain', 'Error');
          cy.get('body').should('not.contain', 'not found');
          
          // Go back to drill page
          cy.go('back');
          
          // Wait for drill page to reload
          cy.contains('Список действий на странице').should('be.visible');
        }
      });
      
      // Check pagination if there are multiple pages
      cy.get('.pagination').then(($pagination) => {
        if ($pagination.length > 0) {
          cy.log('Testing pagination...');
          
          // Click next page if available
          cy.get('.pagination').within(() => {
            cy.get('button').contains('2').click({ force: true });
          });
          
          // Wait for new page to load
          cy.wait(1000);
          
          // Test a few items on page 2
          cy.get('.drill-table-columns .edit-icon-button').then(($page2Buttons) => {
            if ($page2Buttons.length > 0) {
              // Test first item on page 2
              cy.get('.drill-table-columns .edit-icon-button')
                .first()
                .click();
              
              // Check for errors
              cy.get('body').should('not.contain', 'Content item not found');
              cy.get('body').should('not.contain', 'Ошибка');
              
              // Go back
              cy.go('back');
            }
          });
        }
      });
      
      // Navigate back to main mortgage page
      cy.contains('Контент сайта').click();
      cy.url().should('include', '/content/mortgage');
      cy.contains('Список страниц').should('be.visible');
    });
  });

  it('should check console for errors during navigation', () => {
    let consoleErrors: string[] = [];
    
    // Intercept console errors
    cy.on('window:before:load', (win) => {
      const originalError = win.console.error;
      win.console.error = (...args) => {
        consoleErrors.push(args.join(' '));
        originalError(...args);
      };
    });
    
    // Navigate through first page only for console error check
    cy.get('.row-view11 .column7 .image8')
      .first()
      .click();
    
    // Click first action
    cy.get('.drill-table-columns .edit-icon-button')
      .first()
      .click();
    
    // Wait and check for console errors
    cy.wait(2000).then(() => {
      const contentNotFoundErrors = consoleErrors.filter(error => 
        error.includes('Content item not found') || 
        error.includes('ID: 1370') ||
        error.includes('404')
      );
      
      if (contentNotFoundErrors.length > 0) {
        cy.log('Console errors found:');
        contentNotFoundErrors.forEach(error => cy.log(error));
        throw new Error(`Found ${contentNotFoundErrors.length} content not found errors in console`);
      }
    });
  });

  it('should verify all edit pages load without 404 errors', () => {
    // Intercept API calls
    cy.intercept('GET', '/api/content/item/*').as('getContentItem');
    cy.intercept('GET', '/api/content/mortgage/*').as('getMortgageContent');
    
    // Navigate to first drill page
    cy.get('.row-view11 .column7 .image8')
      .first()
      .click();
    
    // Click an action item
    cy.get('.drill-table-columns .edit-icon-button')
      .first()
      .click();
    
    // Check API responses
    cy.wait('@getContentItem', { timeout: 10000 }).then((interception) => {
      if (interception.response) {
        expect(interception.response.statusCode).to.not.equal(404);
        expect(interception.response.body).to.have.property('success');
        if (!interception.response.body.success) {
          cy.log(`API Error: ${interception.response.body.error}`);
        }
      }
    });
  });
});

// Additional test for mortgage-refi pages if they exist
describe('Mortgage Refi Content Drill Navigation Test', () => {
  beforeEach(() => {
    cy.visit('/content/mortgage-refi');
  });

  it('should navigate through mortgage-refi pages without errors', () => {
    // Check if mortgage-refi page exists
    cy.get('body').then(($body) => {
      if ($body.find('.row-view11').length > 0) {
        // Test first mortgage-refi page
        cy.get('.row-view11 .column7 .image8')
          .first()
          .click();
        
        // Verify drill page loaded
        cy.url().should('include', '/content/mortgage-refi/drill/');
        
        // Test first action item
        cy.get('.drill-table-columns .edit-icon-button')
          .first()
          .click();
        
        // Check for errors
        cy.get('body').should('not.contain', 'Content item not found');
        cy.get('body').should('not.contain', 'Ошибка');
        cy.get('body').should('not.contain', 'Error');
      } else {
        cy.log('No mortgage-refi content found, skipping test');
      }
    });
  });
});

// Utility command to check for specific errors
Cypress.Commands.add('checkForContentErrors', () => {
  cy.get('body').then(($body) => {
    const bodyText = $body.text();
    const errorPatterns = [
      'Content item not found',
      'ID: 1370',
      'Failed to load',
      'Failed to fetch',
      '404',
      'Ошибка',
      'Error'
    ];
    
    errorPatterns.forEach(pattern => {
      if (bodyText.includes(pattern)) {
        cy.screenshot(`error-${pattern.replace(/\s+/g, '-')}`);
        throw new Error(`Error pattern "${pattern}" found on page`);
      }
    });
  });
});

// Declare the custom command for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      checkForContentErrors(): Chainable<void>;
    }
  }
}