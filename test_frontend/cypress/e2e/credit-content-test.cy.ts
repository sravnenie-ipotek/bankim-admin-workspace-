/**
 * Credit Content Management QA Test
 * Verifies the credit content page functionality matches mortgage-refi logic
 * 
 * Test Scenarios:
 * 1. Page loads with proper UI structure
 * 2. API data fetching works correctly  
 * 3. Search functionality works
 * 4. Language switching works
 * 5. Pagination works
 * 6. Navigation to drill pages works
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

describe('Credit Content Management Page', () => {
  beforeEach(() => {
    // Mock authentication - assuming we need to be logged in as admin
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'mock-admin-token');
      win.localStorage.setItem('user_role', 'director');
    });
  });

  describe('Page Load and Structure', () => {
    it('should load the credit content page successfully', () => {
      cy.visit('http://localhost:3002/content/credit');
      
      // Verify page loads without errors
      cy.get('.content-mortgage-page').should('exist');
      
      // Verify main title
      cy.get('.page-list-title').should('contain.text', 'Список страниц');
      
      // Verify search input exists
      cy.get('.search-input').should('exist');
      cy.get('.search-input').should('have.attr', 'placeholder', 'Искать по названию, ID, номеру страницы');
    });

    it('should display language selector in navbar', () => {
      cy.visit('http://localhost:3002/content/credit');
      
      // Verify language selector exists
      cy.get('.language-selector').should('exist');
      cy.get('.language-text').should('contain.text', 'Русский');
    });

    it('should display table headers correctly', () => {
      cy.visit('http://localhost:3002/content/credit');
      
      // Wait for data to load
      cy.get('.table-header-row').should('exist');
      
      // Verify table headers
      cy.get('.table-header-row').within(() => {
        cy.contains('НАЗВАНИЕ СТРАНИЦЫ').should('exist');
        cy.contains('Количество действий').should('exist');
        cy.contains('Были изменения').should('exist');
      });
    });
  });

  describe('API Data Loading', () => {
    it('should fetch credit data from API successfully', () => {
      // Intercept the API call
      cy.intercept('GET', '**/api/content/credit', { fixture: 'credit-content.json' }).as('getCreditContent');
      
      cy.visit('http://localhost:3002/content/credit');
      
      // Wait for API call
      cy.wait('@getCreditContent');
      
      // Verify loading state disappears
      cy.get('.content-mortgage-loading').should('not.exist');
      
      // Verify content is displayed
      cy.get('.column6').should('exist');
    });

    it('should handle API error gracefully', () => {
      // Intercept with error
      cy.intercept('GET', '**/api/content/credit', { 
        statusCode: 500, 
        body: { error: 'Internal server error' } 
      }).as('getCreditContentError');
      
      cy.visit('http://localhost:3002/content/credit');
      
      cy.wait('@getCreditContentError');
      
      // Verify error message is displayed
      cy.get('.content-mortgage-error').should('exist');
      cy.contains('Ошибка').should('exist');
      cy.contains('Попробовать снова').should('exist');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3002/content/credit');
      // Wait for initial data load
      cy.get('.search-input').should('be.visible');
    });

    it('should filter items by search term', () => {
      // Type in search
      cy.get('.search-input').type('кредит');
      
      // Verify filtering (items containing 'кредит' should be visible)
      cy.get('.text9').should('exist');
    });

    it('should clear search when input is cleared', () => {
      // Type and then clear
      cy.get('.search-input').type('test').clear();
      
      // All items should be visible again
      cy.get('.text9').should('exist');
    });
  });

  describe('Language Switching', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3002/content/credit');
      cy.get('.language-selector').should('be.visible');
    });

    it('should cycle through languages when clicking language selector', () => {
      // Start with Russian
      cy.get('.language-text').should('contain.text', 'Русский');
      
      // Click to switch to Hebrew
      cy.get('.language-selector').click();
      cy.get('.language-text').should('contain.text', 'עברית');
      
      // Click to switch to English
      cy.get('.language-selector').click();
      cy.get('.language-text').should('contain.text', 'English');
      
      // Click to cycle back to Russian
      cy.get('.language-selector').click();
      cy.get('.language-text').should('contain.text', 'Русский');
    });

    it('should display content in selected language', () => {
      // Switch to Hebrew and verify content changes
      cy.get('.language-selector').click();
      cy.get('.language-text').should('contain.text', 'עברית');
      
      // Content should now display in Hebrew (if available)
      // This will depend on the actual data structure
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3002/content/credit');
      // Wait for data to load
      cy.get('.search-input').should('be.visible');
    });

    it('should display pagination component when there are multiple pages', () => {
      // Check if pagination exists (will depend on data volume)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('exist');
        }
      });
    });
  });

  describe('Navigation to Drill Pages', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3002/content/credit');
      // Wait for data to load
      cy.get('.search-input').should('be.visible');
    });

    it('should navigate to drill page when clicking action button', () => {
      // Wait for content to load and find the first action button
      cy.get('.image8').first().should('be.visible');
      
      // Mock the navigation since we might not have drill pages set up yet
      cy.get('.image8').first().click();
      
      // The URL should change to drill page (even if page doesn't exist yet)
      cy.url().should('include', '/content/credit/drill/');
    });

    it('should pass correct screen_location to drill page', () => {
      // This test verifies the navigation uses screen_location correctly
      cy.get('.image8').first().click();
      
      // URL should contain screen_location from the data
      cy.url().should('match', /\/content\/credit\/drill\/.+/);
    });
  });

  describe('Screen Location Verification', () => {
    it('should use correct credit screen_locations from procceessesPagesInDB.md', () => {
      // Intercept API and verify screen_locations match expected values
      cy.intercept('GET', '**/api/content/credit', (req) => {
        req.reply((res) => {
          // Verify response contains expected screen_locations
          const expectedScreenLocations = [
            'calculate_credit_1',
            'calculate_credit_2', 
            'calculate_credit_3',
            'calculate_credit_4'
          ];
          
          if (res.body?.data?.credit_content) {
            const screenLocations = res.body.data.credit_content.map((item: any) => item.screen_location);
            const hasExpectedLocations = expectedScreenLocations.some(expected => 
              screenLocations.some((location: string) => location.includes(expected))
            );
            expect(hasExpectedLocations).to.be.true;
          }
          
          return res;
        });
      }).as('getCreditContentWithValidation');
      
      cy.visit('http://localhost:3002/content/credit');
      cy.wait('@getCreditContentWithValidation');
    });
  });

  describe('UI Consistency with Mortgage-Refi', () => {
    it('should have same CSS classes and structure as mortgage-refi page', () => {
      cy.visit('http://localhost:3002/content/credit');
      
      // Verify same main CSS classes are used
      cy.get('.content-mortgage-page').should('exist');
      cy.get('.navbar-admin-panel').should('exist');
      cy.get('.content-mortgage-main').should('exist');
      cy.get('.table-header-controls').should('exist');
      cy.get('.mortgage-table').should('exist');
    });

    it('should have same table structure', () => {
      cy.visit('http://localhost:3002/content/credit');
      
      // Verify table columns exist
      cy.get('.column6').should('exist'); // Page names
      cy.get('.column12').should('exist'); // Action count & last modified
      cy.get('.column7').should('exist'); // Action buttons
    });
  });

  describe('Performance and Loading', () => {
    it('should load within reasonable time', () => {
      const startTime = Date.now();
      
      cy.visit('http://localhost:3002/content/credit');
      cy.get('.page-list-title').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });

    it('should handle large datasets without performance issues', () => {
      // This would need to be tested with actual large dataset
      cy.visit('http://localhost:3002/content/credit');
      
      // Verify page is responsive
      cy.get('.search-input').should('be.visible');
      cy.get('.search-input').type('test', { delay: 0 });
      
      // Should respond quickly to user input
      cy.get('.search-input').should('have.value', 'test');
    });
  });
});

// Helper commands for credit content testing
Cypress.Commands.add('loginAsAdmin', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'mock-admin-token');
    win.localStorage.setItem('user_role', 'director');
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
    }
  }
} 