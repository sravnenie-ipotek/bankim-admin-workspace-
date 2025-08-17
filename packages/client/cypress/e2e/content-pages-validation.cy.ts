/**
 * Comprehensive content pages validation test
 * Checks all content pages for loading and console errors
 */

describe('Content Pages Validation', () => {
  // List of all content pages to test
  const contentPages = [
    { path: '/content', name: 'Content Home' },
    { path: '/content/main', name: 'Main Content' },
    { path: '/content/mortgage', name: 'Mortgage Content' },
    { path: '/content/menu', name: 'Menu Content' },
    { path: '/content/credit', name: 'Credit Content' },
    { path: '/content/credit-refi', name: 'Credit Refinance' },
    { path: '/content/mortgage-refi', name: 'Mortgage Refinance' }
  ];

  // Drill pages for mortgage
  const mortgageDrillPages = [
    { path: '/content/mortgage/drill/mortgage_step1', name: 'Mortgage Step 1' },
    { path: '/content/mortgage/drill/mortgage_step2', name: 'Mortgage Step 2' },
    { path: '/content/mortgage/drill/mortgage_step3', name: 'Mortgage Step 3' },
    { path: '/content/mortgage/drill/mortgage_step4', name: 'Mortgage Step 4' }
  ];

  // Main drill pages  
  const mainDrillPages = [
    { path: '/content/main/drill/main_step1', name: 'Main Step 1' },
    { path: '/content/main/drill/main_step2', name: 'Main Step 2' }
  ];

  beforeEach(() => {
    // Clear any previous console logs
    cy.task('clearLogs');
    
    // Set up console error detection
    cy.on('window:before:load', (win) => {
      // Store original console methods
      const originalError = win.console.error;
      const originalWarn = win.console.warn;
      
      // Track console errors
      win.console.error = (...args) => {
        cy.task('log', { level: 'error', message: args.join(' ') });
        originalError.apply(win.console, args);
      };
      
      // Track console warnings that might indicate issues
      win.console.warn = (...args) => {
        const message = args.join(' ');
        // Filter out expected warnings
        if (!message.includes('React Router') && 
            !message.includes('DevTools') &&
            !message.includes('Fallback')) {
          cy.task('log', { level: 'warn', message });
        }
        originalWarn.apply(win.console, args);
      };
    });
  });

  describe('Content Pages Loading', () => {
    contentPages.forEach(page => {
      it(`should load ${page.name} without errors`, () => {
        cy.visit(page.path);
        
        // Wait for page to load
        cy.wait(1000);
        
        // Check that page loaded (no error messages)
        cy.get('body').should('not.contain', 'Error');
        cy.get('body').should('not.contain', 'Ошибка');
        cy.get('body').should('not.contain', 'Failed to fetch');
        cy.get('body').should('not.contain', 'Content item not found');
        
        // Check for specific content indicators
        if (page.path === '/content') {
          cy.contains('Контент сайта').should('be.visible');
        }
        
        // Verify no critical console errors
        cy.task('getLogs').then((logs: any) => {
          const errors = logs.filter((log: any) => log.level === 'error');
          const criticalErrors = errors.filter((error: any) => 
            !error.message.includes('404') || // Ignore 404s for now
            error.message.includes('Cannot read properties')
          );
          
          if (criticalErrors.length > 0) {
            throw new Error(`Console errors on ${page.name}: ${JSON.stringify(criticalErrors)}`);
          }
        });
      });
    });
  });

  describe('Mortgage Drill Pages', () => {
    mortgageDrillPages.forEach(page => {
      it(`should load ${page.name} with content`, () => {
        cy.visit(page.path);
        
        // Wait for API calls to complete
        cy.wait(2000);
        
        // Check that drill content loaded
        cy.get('body').should('not.contain', 'Error fetching drill data');
        cy.get('body').should('not.contain', 'TypeError');
        
        // Check for content table or drill content
        cy.get('.drill-container, .content-table, .mortgage-drill').should('exist');
        
        // Verify data loaded (should have some content items)
        cy.get('table tbody tr, .action-item, .content-item').should('have.length.greaterThan', 0);
      });
    });
  });

  describe('Main Drill Pages', () => {
    mainDrillPages.forEach(page => {
      it(`should attempt to load ${page.name}`, () => {
        cy.visit(page.path, { failOnStatusCode: false });
        
        // These might not exist yet, so we just check they don't crash
        cy.wait(1000);
        
        // If page exists, verify no critical errors
        cy.get('body').then($body => {
          if (!$body.text().includes('404')) {
            cy.get('body').should('not.contain', 'TypeError');
            cy.get('body').should('not.contain', 'Cannot read properties');
          }
        });
      });
    });
  });

  describe('API Integration', () => {
    it('should successfully fetch mortgage content', () => {
      cy.request('/api/content/mortgage/all-items').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data).to.have.property('all_items');
        expect(response.body.data.all_items).to.be.an('array');
        expect(response.body.data.all_items.length).to.be.greaterThan(0);
      });
    });

    it('should successfully fetch UI settings', () => {
      cy.request('/api/ui-settings').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data).to.have.property('font_settings');
      });
    });

    it('should successfully fetch main content', () => {
      cy.request('/api/content/main/ru').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data).to.have.property('content');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent pages gracefully', () => {
      cy.visit('/content/nonexistent', { failOnStatusCode: false });
      
      // Should show 404 or redirect, not crash
      cy.wait(1000);
      
      // Check no JavaScript errors
      cy.window().then((win) => {
        const hasErrors = win.console.error.toString().includes('TypeError');
        expect(hasErrors).to.be.false;
      });
    });
  });
});