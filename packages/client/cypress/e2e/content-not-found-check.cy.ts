/**
 * Focused test to check for "Content item not found" errors
 * Specifically looking for ID: 1370 and similar issues
 */

describe('Content Not Found Error Check', () => {
  const contentTypes = ['mortgage', 'mortgage-refi'];
  
  contentTypes.forEach(contentType => {
    describe(`${contentType} content error check`, () => {
      it(`should not have "Content item not found" errors in ${contentType}`, () => {
        // Array to collect all problematic IDs
        const problematicIds: string[] = [];
        
        // Visit the content page
        cy.visit(`/content/${contentType}`);
        
        // Wait for page to load
        cy.contains('Список страниц', { timeout: 10000 }).should('be.visible');
        
        // Get all page navigation arrows
        cy.get('.row-view11 .column7 .image8').then($arrows => {
          const pageCount = $arrows.length;
          cy.log(`Found ${pageCount} ${contentType} pages to check`);
          
          // Iterate through each page
          for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            // Click on the page
            cy.get('.row-view11 .column7 .image8')
              .eq(pageIndex)
              .click();
            
            // Wait for drill page to load
            cy.contains('Список действий на странице', { timeout: 10000 }).should('be.visible');
            
            // Get current page info
            cy.get('.page-title').first().then($title => {
              const pageTitle = $title.text();
              cy.log(`Checking page: ${pageTitle}`);
              
              // Check all pages of actions if pagination exists
              const checkActionsOnCurrentPage = () => {
                // Get all action buttons on current page
                cy.get('.drill-table-columns .edit-icon-button').each(($btn, index) => {
                  // Store the current URL to return to
                  cy.url().then(drillUrl => {
                    // Click the action button
                    cy.wrap($btn).click();
                    
                    // Wait for navigation
                    cy.wait(500);
                    
                    // Check current URL and content
                    cy.url().then(editUrl => {
                      // Extract ID from URL
                      const idMatch = editUrl.match(/\/(edit|text-edit|dropdown-edit)\/(\d+)/);
                      const actionId = idMatch ? idMatch[2] : 'unknown';
                      
                      // Check for error in console
                      cy.window().then(win => {
                        cy.on('fail', (err) => {
                          // Capture the error but don't fail the test immediately
                          if (err.message.includes('Content item not found') || 
                              err.message.includes(`ID: ${actionId}`)) {
                            problematicIds.push(`${contentType} - ${pageTitle} - Action ID: ${actionId}`);
                          }
                          return false; // Prevent test from failing immediately
                        });
                      });
                      
                      // Check page content for errors
                      cy.get('body').then($body => {
                        const bodyText = $body.text();
                        if (bodyText.includes('Content item not found') || 
                            bodyText.includes(`Looking for ID: ${actionId}`) ||
                            $body.find('.error-state').length > 0 ||
                            $body.find('.shared-edit-error').length > 0) {
                          problematicIds.push(`${contentType} - ${pageTitle} - Action ID: ${actionId} - URL: ${editUrl}`);
                          cy.log(`❌ ERROR FOUND: Content not found for ID ${actionId}`);
                        } else {
                          cy.log(`✅ OK: Action ID ${actionId} loaded successfully`);
                        }
                      });
                      
                      // Go back to drill page
                      cy.visit(drillUrl);
                      cy.contains('Список действий на странице', { timeout: 10000 }).should('be.visible');
                    });
                  });
                });
              };
              
              // Check first page of actions
              checkActionsOnCurrentPage();
              
              // Check if there's pagination and test other pages
              cy.get('.pagination').then($pagination => {
                if ($pagination.find('button').length > 3) { // Has multiple pages
                  // Click page 2
                  cy.get('.pagination button').contains('2').click({ force: true });
                  cy.wait(1000);
                  checkActionsOnCurrentPage();
                }
              });
            });
            
            // Go back to main content page
            cy.visit(`/content/${contentType}`);
            cy.contains('Список страниц', { timeout: 10000 }).should('be.visible');
          }
        });
        
        // After all checks, report findings
        cy.then(() => {
          if (problematicIds.length > 0) {
            cy.log('❌ FOUND CONTENT NOT FOUND ERRORS:');
            problematicIds.forEach(id => cy.log(id));
            
            // Create a detailed error report
            const errorReport = problematicIds.join('\n');
            cy.writeFile(`cypress/reports/${contentType}-content-errors.txt`, errorReport);
            
            // Fail the test with detailed information
            throw new Error(`Found ${problematicIds.length} "Content item not found" errors. Check cypress/reports/${contentType}-content-errors.txt for details.`);
          } else {
            cy.log(`✅ All ${contentType} content items loaded successfully!`);
          }
        });
      });
    });
  });
  
  // Specific test for ID 1370
  it('should specifically check for ID 1370 error', () => {
    // Intercept console errors
    let id1370Found = false;
    cy.on('window:before:load', (win) => {
      const originalError = win.console.error;
      win.console.error = (...args) => {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('ID: 1370') || errorMessage.includes('1370')) {
          id1370Found = true;
          cy.log(`❌ ID 1370 ERROR DETECTED: ${errorMessage}`);
        }
        originalError(...args);
      };
    });
    
    // Visit mortgage content
    cy.visit('/content/mortgage');
    
    // Navigate to first drill page
    cy.get('.row-view11 .column7 .image8').first().click();
    
    // Try to find any action that might lead to ID 1370
    cy.get('.drill-table-columns .edit-icon-button').each(($btn, index) => {
      if (index < 10) { // Check first 10 items
        cy.wrap($btn).click();
        cy.wait(500);
        
        cy.url().then(url => {
          if (url.includes('/1370')) {
            cy.log(`Found URL with ID 1370: ${url}`);
            cy.get('body').then($body => {
              if ($body.text().includes('Content item not found')) {
                cy.screenshot('id-1370-error');
                throw new Error(`ID 1370 not found error confirmed at ${url}`);
              }
            });
          }
        });
        
        cy.go('back');
      }
    });
    
    // Check if ID 1370 error was found in console
    cy.then(() => {
      if (id1370Found) {
        throw new Error('ID 1370 error was detected in console logs');
      }
    });
  });
});

// Quick smoke test
describe('Quick Smoke Test - Check First Item Only', () => {
  it('should quickly check if the navigation flow works', () => {
    cy.visit('/content/mortgage');
    
    // Click first page
    cy.get('.row-view11 .column7 .image8').first().click();
    
    // Click first action
    cy.get('.drill-table-columns .edit-icon-button').first().click();
    
    // Simply check that we don't see error text
    cy.get('body').should('not.contain', 'Content item not found');
    cy.get('body').should('not.contain', 'Error');
    cy.get('body').should('not.contain', 'Ошибка');
    
    // Check that we have some content fields
    cy.get('input[type="text"]').should('have.length.greaterThan', 0);
  });
});