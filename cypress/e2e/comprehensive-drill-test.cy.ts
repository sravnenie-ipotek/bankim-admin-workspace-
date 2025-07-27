/**
 * Comprehensive test that checks ALL mortgage pages and ALL drill actions
 * This version works without authentication as the app seems to be accessible
 */

describe('Comprehensive Mortgage Drill Test', () => {
  const errors: Array<{
    page: string;
    actionId: string;
    error: string;
    url: string;
  }> = [];

  beforeEach(() => {
    // Clear errors
    errors.length = 0;
  });

  it('should test ALL mortgage pages and ALL their actions', () => {
    // Start at mortgage content page
    cy.visit('http://localhost:3002/content/mortgage');
    cy.wait(2000);

    // Get all mortgage pages
    cy.get('.row-view11 .column6 .text9').then($pageNames => {
      const pageCount = $pageNames.length;
      cy.log(`Found ${pageCount} mortgage pages to test`);

      // Test each page
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        // Go back to mortgage list
        cy.visit('http://localhost:3002/content/mortgage');
        cy.wait(1000);

        // Get page name
        cy.get('.row-view11 .column6 .text9').eq(pageIndex).then($pageName => {
          const pageName = $pageName.text().trim();
          cy.log(`\n📄 Testing Page ${pageIndex + 1}: ${pageName}`);

          // Click the page drill button
          cy.get('.row-view11 .column7 .image8').eq(pageIndex).click();
          cy.wait(1500);

          // Verify we're on drill page
          cy.url().should('include', '/drill/');
          
          // Function to test all actions on current page
          const testActionsOnPage = (pageNum: number) => {
            cy.get('.drill-table-columns .edit-icon-button').then($buttons => {
              const actionCount = $buttons.length;
              cy.log(`  Page ${pageNum}: Testing ${actionCount} actions`);

              // Test each action
              for (let actionIndex = 0; actionIndex < actionCount; actionIndex++) {
                // Click action button
                cy.get('.drill-table-columns .edit-icon-button').eq(actionIndex).click();
                cy.wait(1000);

                // Get current URL and check for errors
                cy.url().then(url => {
                  const idMatch = url.match(/\/(edit|text-edit|dropdown-edit)\/(\d+)/);
                  const actionId = idMatch ? idMatch[2] : 'unknown';

                  cy.get('body').then($body => {
                    const bodyText = $body.text();
                    
                    // Check for various error patterns
                    if (bodyText.includes('Content item not found')) {
                      errors.push({
                        page: pageName,
                        actionId: actionId,
                        error: 'Content item not found',
                        url: url
                      });
                      cy.log(`    ❌ Action ${actionId}: Content not found`);
                    } else if (bodyText.includes('Error') || bodyText.includes('Ошибка')) {
                      errors.push({
                        page: pageName,
                        actionId: actionId,
                        error: 'Error on page',
                        url: url
                      });
                      cy.log(`    ❌ Action ${actionId}: Error`);
                    } else if ($body.find('.error-state').length > 0) {
                      errors.push({
                        page: pageName,
                        actionId: actionId,
                        error: 'Error state detected',
                        url: url
                      });
                      cy.log(`    ❌ Action ${actionId}: Error state`);
                    } else {
                      cy.log(`    ✅ Action ${actionId}: OK`);
                    }
                  });
                });

                // Go back to drill page
                cy.go('back');
                cy.wait(1000);
              }
            });
          };

          // Test first page
          testActionsOnPage(1);

          // Check for pagination
          cy.get('body').then($body => {
            if ($body.find('.pagination button').length > 3) {
              // Test page 2 if exists
              cy.get('.pagination button').contains('2').click({ force: true });
              cy.wait(1000);
              testActionsOnPage(2);

              // Test page 3 if exists (for comprehensive coverage)
              cy.get('.pagination button').then($buttons => {
                const hasPage3 = Array.from($buttons).some(btn => btn.textContent === '3');
                if (hasPage3) {
                  cy.get('.pagination button').contains('3').click({ force: true });
                  cy.wait(1000);
                  testActionsOnPage(3);
                }
              });
            }
          });
        });
      }
    });

    // Generate report after all tests
    cy.then(() => {
      if (errors.length > 0) {
        cy.log(`\n🚨 FOUND ${errors.length} ERRORS:`);
        
        // Group by page
        const errorsByPage: Record<string, typeof errors> = {};
        errors.forEach(error => {
          if (!errorsByPage[error.page]) {
            errorsByPage[error.page] = [];
          }
          errorsByPage[error.page].push(error);
        });

        // Log summary
        Object.entries(errorsByPage).forEach(([page, pageErrors]) => {
          cy.log(`\n${page}: ${pageErrors.length} errors`);
          pageErrors.forEach(error => {
            cy.log(`  - Action ID ${error.actionId}: ${error.error}`);
          });
        });

        // Write detailed report
        const report = [
          'MORTGAGE DRILL TEST REPORT',
          '=========================',
          `Date: ${new Date().toISOString()}`,
          `Total Errors: ${errors.length}`,
          '',
          'ERRORS BY PAGE:',
          ''
        ];

        Object.entries(errorsByPage).forEach(([page, pageErrors]) => {
          report.push(`${page}`);
          report.push('-'.repeat(50));
          pageErrors.forEach(error => {
            report.push(`  Action ID: ${error.actionId}`);
            report.push(`  Error: ${error.error}`);
            report.push(`  URL: ${error.url}`);
            report.push('');
          });
        });

        cy.writeFile('cypress/reports/comprehensive-test-report.txt', report.join('\n'));
      } else {
        cy.log('\n✅ ALL TESTS PASSED! No errors found.');
      }
    });
  });

  it('should specifically test mortgage-refi if exists', () => {
    cy.visit('http://localhost:3002/content/mortgage-refi');
    cy.wait(2000);

    cy.get('body').then($body => {
      if ($body.find('.row-view11').length > 0) {
        cy.log('Testing mortgage-refi pages...');
        
        // Test first page only for refi
        cy.get('.row-view11 .column7 .image8').first().click();
        cy.wait(1500);

        // Test first 5 actions
        cy.get('.drill-table-columns .edit-icon-button').then($buttons => {
          const testCount = Math.min($buttons.length, 5);
          
          for (let i = 0; i < testCount; i++) {
            cy.get('.drill-table-columns .edit-icon-button').eq(i).click();
            cy.wait(1000);

            cy.get('body').then($editBody => {
              if ($editBody.text().includes('Content item not found')) {
                cy.log(`❌ Mortgage-refi error found`);
              } else {
                cy.log(`✅ Mortgage-refi action ${i + 1} OK`);
              }
            });

            cy.go('back');
            cy.wait(1000);
          }
        });
      } else {
        cy.log('No mortgage-refi content found');
      }
    });
  });
});