/**
 * Content Verification Automation - Cypress Implementation
 * Verifies action counts match between overview and drill pages
 */

describe('Content Verification Automation', () => {
  const baseUrl = 'http://localhost:4003'; // Updated to match current client port
  const contentSections = [
    'main',
    'mortgage', 
    'mortgage-refi',
    'credit',
    'credit-refi',
    'general',
    'menu'
  ];

  let verificationResults = [];

  before(() => {
    // Login before running tests
    cy.visit(`${baseUrl}/login`);
    cy.get('input[type="email"]').type('admin@bankim.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('select').select('director');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });

  contentSections.forEach((section) => {
    describe(`Section: ${section}`, () => {
      
      it(`should extract action counts from ${section} overview`, () => {
        cy.visit(`${baseUrl}/content/${section}`, { 
          failOnStatusCode: false,
          timeout: 30000 
        });
        
        // Wait for content to load
        cy.wait(2000);
        
        // Check if we're on the right page
        cy.url().should('include', `/content/${section}`);
        
        // Extract action counts from overview table
        cy.get('body').then(($body) => {
          const overviewCounts = {};
          
          // Look for different possible table structures
          const selectors = [
            'table tbody tr',
            '[data-testid="content-table"] tr',
            '.content-table tr',
            '.content-row'
          ];
          
          let foundRows = false;
          
          selectors.forEach(selector => {
            if ($body.find(selector).length > 0 && !foundRows) {
              foundRows = true;
              
              cy.get(selector).each(($row, index) => {
                // Skip header rows
                if (index === 0 && $row.find('th').length > 0) return;
                
                const cells = $row.find('td, .cell, [data-cell]');
                if (cells.length >= 2) {
                  const pageName = cells.eq(0).text().trim();
                  const actionCount = parseInt(cells.eq(1).text().trim()) || 0;
                  
                  if (pageName && actionCount > 0) {
                    overviewCounts[pageName] = actionCount;
                    cy.log(`${section} Overview - ${pageName}: ${actionCount} actions`);
                  }
                }
              });
            }
          });
          
          // Store overview counts for comparison
          cy.wrap(overviewCounts).as(`${section}OverviewCounts`);
        });
      });

      it(`should verify drill page counts for ${section}`, () => {
        cy.get(`@${section}OverviewCounts`).then((overviewCounts) => {
          const pageNames = Object.keys(overviewCounts);
          
          if (pageNames.length === 0) {
            cy.log(`No pages found in ${section} overview`);
            return;
          }
          
          pageNames.forEach((pageName, index) => {
            const expectedCount = overviewCounts[pageName];
            
            // Try to navigate to drill page - use different URL patterns
            const drillUrls = [
              `${baseUrl}/content/${section}/drill/${pageName}`,
              `${baseUrl}/content/${section}/drill/${pageName.toLowerCase()}`,
              `${baseUrl}/content/${section}/drill/${index + 1}`,
              `${baseUrl}/content/${section}/drill/page${index + 1}`
            ];
            
            drillUrls.forEach(drillUrl => {
              cy.visit(drillUrl, { failOnStatusCode: false });
              
              cy.wait(2000);
              
              // Check if we successfully loaded a drill page
              cy.get('body').then(($body) => {
                if (!$body.text().includes('404') && !$body.text().includes('Not Found')) {
                  
                  // Count actions on drill page
                  let actualCount = 0;
                  
                  // Look for various action indicators
                  const actionSelectors = [
                    '.action-item',
                    '[data-testid="action"]',
                    '.content-action',
                    '.form-field',
                    '.input-field',
                    '.action-row',
                    'tr[data-action]',
                    '[class*="action"]'
                  ];
                  
                  actionSelectors.forEach(selector => {
                    const count = $body.find(selector).length;
                    if (count > actualCount) {
                      actualCount = count;
                    }
                  });
                  
                  // Log and verify count
                  const result = {
                    section,
                    pageName,
                    expectedCount,
                    actualCount,
                    match: expectedCount === actualCount,
                    drillUrl
                  };
                  
                  cy.log(`${section} - ${pageName}: Expected ${expectedCount}, Found ${actualCount}`);
                  
                  // Store result for final report
                  verificationResults.push(result);
                  
                  // Assertion
                  expect(actualCount, `Action count mismatch for ${section}/${pageName}`).to.equal(expectedCount);
                }
              });
            });
          });
        });
      });
    });
  });

  after(() => {
    // Generate final verification report
    cy.task('generateVerificationReport', verificationResults);
  });
});

/**
 * Navigation Verification Test
 * Verifies all content navigation links work
 */
describe('Content Navigation Verification', () => {
  const baseUrl = 'http://localhost:4003';
  
  before(() => {
    // Login
    cy.visit(`${baseUrl}/login`);
    cy.get('input[type="email"]').type('admin@bankim.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('select').select('director');
    cy.get('button[type="submit"]').click();
  });

  it('should verify all content section links are accessible', () => {
    const sections = ['main', 'mortgage', 'mortgage-refi', 'credit', 'credit-refi', 'general', 'menu'];
    
    sections.forEach(section => {
      cy.visit(`${baseUrl}/content/${section}`, { failOnStatusCode: false });
      cy.wait(1000);
      
      // Verify page loads without error
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('not.contain', 'Error');
      
      // Verify URL is correct
      cy.url().should('include', `/content/${section}`);
      
      cy.log(`✅ ${section} section is accessible`);
    });
  });

  it('should verify main navigation menu works', () => {
    cy.visit(`${baseUrl}/content/main`);
    
    // Look for navigation menu
    cy.get('body').then(($body) => {
      const menuSelectors = [
        '.nav-menu',
        '.navigation',
        '.menu',
        '[data-testid="navigation"]',
        '.sidebar',
        '.main-menu'
      ];
      
      menuSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible');
          cy.log(`✅ Found navigation menu: ${selector}`);
        }
      });
    });
  });
});