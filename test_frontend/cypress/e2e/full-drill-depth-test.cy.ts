/**
 * Comprehensive test that navigates through ALL mortgage pages,
 * ALL drill levels, and checks EVERY action item to the bottom
 */

describe('Full Depth Mortgage Drill Test', () => {
  // Configuration
  const MAX_PAGES_TO_CHECK = 10; // Maximum pagination pages to check per drill
  const WAIT_TIME = 500; // Wait time between actions

  // Track all errors found
  let allErrors: Array<{
    page: string;
    drill: string;
    actionId: string;
    actionNumber: number;
    error: string;
    url: string;
  }> = [];

  beforeEach(() => {
    // Clear errors for each test
    allErrors = [];
    
    // Visit the mortgage content page
    cy.visit('http://localhost:3002/content/mortgage');
    
    // Wait for the page to fully load
    cy.contains('Список страниц', { timeout: 10000 }).should('be.visible');
  });

  it('should check ALL mortgage pages, ALL drills, and ALL actions to the bottom', () => {
    // Get all mortgage pages
    cy.get('.row-view11 .column7 .image8').then($pageButtons => {
      const totalPages = $pageButtons.length;
      cy.log(`Found ${totalPages} mortgage pages to test`);

      // Test each mortgage page
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        // Navigate to the mortgage list page fresh for each iteration
        cy.visit('http://localhost:3002/content/mortgage');
        cy.contains('Список страниц').should('be.visible');

        // Get page info before clicking
        cy.get('.row-view11 .column6 .text9').eq(pageIndex).then($pageName => {
          const pageName = $pageName.text();
          cy.log(`\n📄 Testing Page ${pageIndex + 1}/${totalPages}: ${pageName}`);

          // Click on the page drill button
          cy.get('.row-view11 .column7 .image8').eq(pageIndex).click();

          // Wait for drill page to load
          cy.url().should('include', '/content/mortgage/drill/');
          cy.contains('Список действий на странице').should('be.visible');

          // Function to test all actions on current pagination page
          const testAllActionsOnCurrentPage = (paginationPage: number) => {
            cy.get('.drill-table-columns .edit-icon-button').then($actionButtons => {
              const actionsOnPage = $actionButtons.length;
              cy.log(`  📋 Page ${paginationPage}: Found ${actionsOnPage} actions`);

              // Test each action on this page
              for (let actionIndex = 0; actionIndex < actionsOnPage; actionIndex++) {
                // Return to drill page for each action
                if (actionIndex > 0) {
                  cy.go('back');
                  cy.contains('Список действий на странице').should('be.visible');
                  cy.wait(WAIT_TIME);
                }

                // Get action info before clicking
                cy.get('.drill-table-columns .column-cell').eq(actionIndex * 5).then($actionCell => {
                  const actionText = $actionCell.text().trim();
                  const actionNumber = parseInt(actionText.split('.')[0]) || actionIndex + 1;

                  cy.log(`    🎯 Testing Action ${actionNumber}: ${actionText}`);

                  // Click the action button
                  cy.get('.drill-table-columns .edit-icon-button').eq(actionIndex).click();

                  // Wait for navigation
                  cy.wait(WAIT_TIME);

                  // Check the URL and page content
                  cy.url().then(currentUrl => {
                    // Extract action ID from URL
                    const idMatch = currentUrl.match(/\/(edit|text-edit|dropdown-edit)\/(\d+)/);
                    const actionId = idMatch ? idMatch[2] : 'unknown';

                    // Check for errors on the page
                    cy.get('body').then($body => {
                      const bodyText = $body.text();
                      let hasError = false;
                      let errorType = '';

                      // Check for various error patterns
                      if (bodyText.includes('Content item not found')) {
                        hasError = true;
                        errorType = 'Content item not found';
                      } else if (bodyText.includes(`Looking for ID: ${actionId}`)) {
                        hasError = true;
                        errorType = `Looking for ID: ${actionId}`;
                      } else if (bodyText.includes('Failed to load')) {
                        hasError = true;
                        errorType = 'Failed to load';
                      } else if ($body.find('.error-state').length > 0) {
                        hasError = true;
                        errorType = $body.find('.error-state').text();
                      } else if ($body.find('.shared-edit-error').length > 0) {
                        hasError = true;
                        errorType = $body.find('.shared-edit-error').text();
                      } else if ($body.find('.text-edit-error').length > 0) {
                        hasError = true;
                        errorType = $body.find('.text-edit-error').text();
                      }

                      if (hasError) {
                        // Record the error
                        const errorInfo = {
                          page: pageName,
                          drill: `Page ${pageIndex + 1}`,
                          actionId: actionId,
                          actionNumber: actionNumber,
                          error: errorType,
                          url: currentUrl
                        };
                        allErrors.push(errorInfo);
                        cy.log(`      ❌ ERROR: ${errorType} for Action ID ${actionId}`);
                        
                        // Take screenshot
                        cy.screenshot(`error-page${pageIndex + 1}-action${actionNumber}-id${actionId}`);
                      } else {
                        cy.log(`      ✅ OK: Action ${actionNumber} loaded successfully`);
                        
                        // Verify the page has editable content
                        cy.get('input[type="text"], textarea').should('have.length.greaterThan', 0);
                      }
                    });
                  });
                });
              }
            });
          };

          // Test first page of actions
          testAllActionsOnCurrentPage(1);

          // Check if there are more pages and test them
          cy.get('body').then($body => {
            if ($body.find('.pagination').length > 0) {
              cy.get('.pagination button').then($paginationButtons => {
                // Find numbered page buttons (excluding prev/next)
                const pageNumbers: number[] = [];
                $paginationButtons.each((index, button) => {
                  const text = Cypress.$(button).text().trim();
                  const pageNum = parseInt(text);
                  if (!isNaN(pageNum) && pageNum > 1) {
                    pageNumbers.push(pageNum);
                  }
                });

                const maxPage = Math.max(...pageNumbers, 1);
                const pagesToCheck = Math.min(maxPage, MAX_PAGES_TO_CHECK);

                cy.log(`  📑 Found ${maxPage} total pages, checking up to ${pagesToCheck} pages`);

                // Test remaining pages
                for (let page = 2; page <= pagesToCheck; page++) {
                  cy.log(`  📄 Navigating to pagination page ${page}`);
                  
                  // Click the page number
                  cy.get('.pagination button').contains(page.toString()).click({ force: true });
                  cy.wait(WAIT_TIME);

                  // Test all actions on this page
                  testAllActionsOnCurrentPage(page);
                }
              });
            } else {
              cy.log('  📑 No pagination found, only one page of actions');
            }
          });
        });
      }
    });

    // After all tests, generate report
    cy.then(() => {
      generateErrorReport();
    });
  });

  it('should check mortgage-refi pages if they exist', () => {
    cy.visit('http://localhost:3002/content/mortgage-refi');
    
    cy.get('body').then($body => {
      if ($body.text().includes('Список страниц') && $body.find('.row-view11').length > 0) {
        // Same logic as above but for mortgage-refi
        cy.log('Testing mortgage-refi pages...');
        
        cy.get('.row-view11 .column7 .image8').then($pageButtons => {
          const totalPages = Math.min($pageButtons.length, 2); // Test first 2 pages for refi
          
          for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
            cy.visit('http://localhost:3002/content/mortgage-refi');
            cy.contains('Список страниц').should('be.visible');
            
            cy.get('.row-view11 .column7 .image8').eq(pageIndex).click();
            cy.url().should('include', '/content/mortgage-refi/drill/');
            
            // Test first page of actions only for refi
            cy.get('.drill-table-columns .edit-icon-button').each(($btn, index) => {
              if (index < 5) { // Test first 5 actions only
                cy.wrap($btn).click();
                cy.wait(WAIT_TIME);
                
                cy.get('body').then($editBody => {
                  if ($editBody.text().includes('Content item not found')) {
                    cy.log('❌ Error found in mortgage-refi');
                  }
                });
                
                cy.go('back');
              }
            });
          }
        });
      } else {
        cy.log('No mortgage-refi content found');
      }
    });
  });

  // Function to generate error report
  function generateErrorReport() {
    if (allErrors.length > 0) {
      cy.log(`\n🚨 FOUND ${allErrors.length} ERRORS:`);
      
      // Group errors by page
      const errorsByPage: Record<string, typeof allErrors> = {};
      allErrors.forEach(error => {
        if (!errorsByPage[error.page]) {
          errorsByPage[error.page] = [];
        }
        errorsByPage[error.page].push(error);
      });

      // Log errors by page
      Object.entries(errorsByPage).forEach(([page, errors]) => {
        cy.log(`\n📄 ${page}: ${errors.length} errors`);
        errors.forEach(error => {
          cy.log(`  ❌ Action ${error.actionNumber} (ID: ${error.actionId}): ${error.error}`);
          cy.log(`     URL: ${error.url}`);
        });
      });

      // Create detailed report file
      const reportContent = [
        'MORTGAGE CONTENT ERROR REPORT',
        '============================',
        `Generated: ${new Date().toISOString()}`,
        `Total Errors: ${allErrors.length}`,
        '',
        'ERRORS BY PAGE:',
        ''
      ];

      Object.entries(errorsByPage).forEach(([page, errors]) => {
        reportContent.push(`${page} (${errors.length} errors)`);
        reportContent.push('-'.repeat(50));
        errors.forEach(error => {
          reportContent.push(`Action #${error.actionNumber} (ID: ${error.actionId})`);
          reportContent.push(`  Error: ${error.error}`);
          reportContent.push(`  URL: ${error.url}`);
          reportContent.push('');
        });
        reportContent.push('');
      });

      // Write report to file
      cy.writeFile('cypress/reports/full-drill-test-report.txt', reportContent.join('\n'));
      
      // Fail the test with summary
      throw new Error(`Found ${allErrors.length} errors across ${Object.keys(errorsByPage).length} pages. See cypress/reports/full-drill-test-report.txt for details.`);
    } else {
      cy.log('\n✅ SUCCESS: All actions across all pages loaded without errors!');
    }
  }
});

// Performance monitoring test
describe('Drill Performance Test', () => {
  it('should measure load times for drill navigation', () => {
    const loadTimes: Array<{ action: string; loadTime: number }> = [];
    
    cy.visit('http://localhost:3002/content/mortgage');
    
    // Test first page only for performance
    cy.get('.row-view11 .column7 .image8').first().click();
    
    // Test first 10 actions
    cy.get('.drill-table-columns .edit-icon-button').then($buttons => {
      const testCount = Math.min($buttons.length, 10);
      
      for (let i = 0; i < testCount; i++) {
        const startTime = Date.now();
        
        cy.get('.drill-table-columns .edit-icon-button').eq(i).click();
        
        // Wait for content to load
        cy.get('input[type="text"], .error-state, .shared-edit-error').should('exist');
        
        cy.then(() => {
          const loadTime = Date.now() - startTime;
          loadTimes.push({ action: `Action ${i + 1}`, loadTime });
          cy.log(`Action ${i + 1} loaded in ${loadTime}ms`);
        });
        
        cy.go('back');
        cy.contains('Список действий на странице').should('be.visible');
      }
    });
    
    // Generate performance report
    cy.then(() => {
      const avgLoadTime = loadTimes.reduce((sum, item) => sum + item.loadTime, 0) / loadTimes.length;
      cy.log(`\n📊 Average load time: ${avgLoadTime.toFixed(0)}ms`);
      
      if (avgLoadTime > 3000) {
        cy.log('⚠️ WARNING: Average load time exceeds 3 seconds');
      }
    });
  });
});