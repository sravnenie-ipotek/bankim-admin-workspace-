/**
 * Final comprehensive test to find all missing content IDs
 */

describe('Final Comprehensive Test - All Missing Content IDs', () => {
  const missingIds: number[] = [];
  const foundIds: number[] = [];

  it('should find all missing content IDs by checking actual drill actions', () => {
    // Visit the app (should work without explicit login based on previous tests)
    cy.visit('http://localhost:3002/content/mortgage');
    cy.wait(3000);

    // Check if we can see the mortgage pages without login
    cy.get('body').then($body => {
      if ($body.text().includes('Калькулятор ипотеки')) {
        cy.log('✅ Can access mortgage pages directly');
        
        // Test the first mortgage page "Калькулятор ипотеки" (168 actions)
        cy.get('.row-view11').first().find('.column7 .image8').click();
        cy.wait(2000);

        // Check first 20 actions to sample for missing IDs
        cy.get('.drill-table-columns .edit-icon-button').then($buttons => {
          const totalButtons = $buttons.length;
          const sampleSize = Math.min(totalButtons, 20);
          cy.log(`Testing ${sampleSize} actions from ${totalButtons} total`);

          for (let i = 0; i < sampleSize; i++) {
            cy.get('.drill-table-columns .edit-icon-button').eq(i).click();
            cy.wait(1000);

            cy.url().then(url => {
              const match = url.match(/\/(text-edit|dropdown-edit)\/(\d+)/);
              if (match) {
                const actionId = parseInt(match[2]);
                
                cy.get('body').then($editBody => {
                  const bodyText = $editBody.text();
                  
                  if (bodyText.includes('Content item not found') || 
                      bodyText.includes('❌ Content item not found')) {
                    missingIds.push(actionId);
                    cy.log(`❌ Missing ID: ${actionId}`);
                  } else if (bodyText.includes('Редактировать текст') || 
                             bodyText.includes('Заголовок действия')) {
                    foundIds.push(actionId);
                    cy.log(`✅ Found ID: ${actionId}`);
                  }
                });
              }
            });

            // Go back
            cy.go('back');
            cy.wait(1000);
          }
        });

        // Test second pagination page if it exists
        cy.get('body').then($body => {
          if ($body.find('.pagination').length > 0) {
            cy.get('.pagination button').then($buttons => {
              const has2ndPage = Array.from($buttons).some(btn => btn.textContent === '2');
              if (has2ndPage) {
                cy.log('Testing second pagination page...');
                cy.get('.pagination button').contains('2').click();
                cy.wait(1500);

                // Test first 10 actions from page 2
                cy.get('.drill-table-columns .edit-icon-button').then($page2Buttons => {
                  const page2Sample = Math.min($page2Buttons.length, 10);
                  
                  for (let i = 0; i < page2Sample; i++) {
                    cy.get('.drill-table-columns .edit-icon-button').eq(i).click();
                    cy.wait(1000);

                    cy.url().then(url => {
                      const match = url.match(/\/(text-edit|dropdown-edit)\/(\d+)/);
                      if (match) {
                        const actionId = parseInt(match[2]);
                        
                        cy.get('body').then($editBody => {
                          const bodyText = $editBody.text();
                          
                          if (bodyText.includes('Content item not found')) {
                            missingIds.push(actionId);
                            cy.log(`❌ Missing ID (page 2): ${actionId}`);
                          } else if (bodyText.includes('Редактировать текст')) {
                            foundIds.push(actionId);
                            cy.log(`✅ Found ID (page 2): ${actionId}`);
                          }
                        });
                      }
                    });

                    cy.go('back');
                    cy.wait(1000);
                  }
                });
              }
            });
          }
        });

        // Test second mortgage page "Анкета личных данных" (61 actions)
        cy.visit('http://localhost:3002/content/mortgage');
        cy.wait(2000);

        cy.get('.row-view11').then($pages => {
          if ($pages.length > 1) {
            cy.get('.row-view11').eq(1).find('.column7 .image8').click();
            cy.wait(2000);

            // Test first 10 actions from second mortgage page
            cy.get('.drill-table-columns .edit-icon-button').then($buttons => {
              const sampleSize = Math.min($buttons.length, 10);
              cy.log(`Testing ${sampleSize} actions from second mortgage page`);

              for (let i = 0; i < sampleSize; i++) {
                cy.get('.drill-table-columns .edit-icon-button').eq(i).click();
                cy.wait(1000);

                cy.url().then(url => {
                  const match = url.match(/\/(text-edit|dropdown-edit)\/(\d+)/);
                  if (match) {
                    const actionId = parseInt(match[2]);
                    
                    cy.get('body').then($editBody => {
                      const bodyText = $editBody.text();
                      
                      if (bodyText.includes('Content item not found')) {
                        missingIds.push(actionId);
                        cy.log(`❌ Missing ID (page 2): ${actionId}`);
                      } else if (bodyText.includes('Редактировать текст')) {
                        foundIds.push(actionId);
                        cy.log(`✅ Found ID (page 2): ${actionId}`);
                      }
                    });
                  }
                });

                cy.go('back');
                cy.wait(1000);
              }
            });
          }
        });

        // Direct test for ID 1370
        cy.visit('http://localhost:3002/content/mortgage/drill/1/text-edit/1370');
        cy.wait(2000);
        
        cy.get('body').then($body => {
          const bodyText = $body.text();
          if (bodyText.includes('Content item not found')) {
            missingIds.push(1370);
            cy.log('❌ ID 1370: NOT FOUND (confirmed)');
          } else if (bodyText.includes('Редактировать текст')) {
            foundIds.push(1370);
            cy.log('✅ ID 1370: FOUND');
          }
        });

      } else {
        cy.log('❌ Cannot access mortgage pages - authentication required');
      }
    });

    // Generate final report
    cy.then(() => {
      const uniqueMissingIds = [...new Set(missingIds)].sort((a, b) => a - b);
      const uniqueFoundIds = [...new Set(foundIds)].sort((a, b) => a - b);
      
      cy.log(`\n📊 FINAL RESULTS:`);
      cy.log(`Missing IDs: ${uniqueMissingIds.join(', ')}`);
      cy.log(`Found IDs: ${uniqueFoundIds.join(', ')}`);
      cy.log(`Total Missing: ${uniqueMissingIds.length}`);
      cy.log(`Total Found: ${uniqueFoundIds.length}`);

      const report = [
        'FINAL COMPREHENSIVE DRILL TEST REPORT',
        '====================================',
        `Date: ${new Date().toISOString()}`,
        `Test Duration: Multiple pages tested`,
        '',
        '📊 SUMMARY:',
        `Total Missing Content IDs: ${uniqueMissingIds.length}`,
        `Total Found Content IDs: ${uniqueFoundIds.length}`,
        '',
        '❌ MISSING CONTENT IDs:',
        uniqueMissingIds.length > 0 ? uniqueMissingIds.join(', ') : 'None found',
        '',
        '✅ WORKING CONTENT IDs (sample):',
        uniqueFoundIds.slice(0, 10).join(', ') + (uniqueFoundIds.length > 10 ? '...' : ''),
        '',
        '🔍 ANALYSIS:',
        uniqueMissingIds.includes(1370) ? '- ID 1370: CONFIRMED MISSING (original error source)' : '- ID 1370: Not tested or found',
        uniqueMissingIds.length > 0 ? `- ${uniqueMissingIds.length} content items need to be added to database` : '- No missing content found',
        '',
        '💡 RECOMMENDATIONS:',
        uniqueMissingIds.length > 0 ? '1. Check database for missing content_items entries' : '1. All tested content items exist',
        uniqueMissingIds.length > 0 ? '2. Verify content_translations table completeness' : '2. System appears to be working correctly',
        uniqueMissingIds.length > 0 ? '3. Consider data migration or content creation' : '3. Continue with normal operations'
      ];

      cy.writeFile('cypress/reports/FINAL-DRILL-TEST-REPORT.txt', report.join('\n'));
      
      if (uniqueMissingIds.length > 0) {
        cy.writeFile('cypress/reports/missing-content-ids.json', {
          missingIds: uniqueMissingIds,
          foundIds: uniqueFoundIds,
          testDate: new Date().toISOString(),
          includesId1370: uniqueMissingIds.includes(1370)
        });
      }

      // Log final conclusion
      if (uniqueMissingIds.includes(1370)) {
        cy.log('\n🎯 CONCLUSION: ID 1370 is confirmed missing from database');
      } else if (uniqueMissingIds.length > 0) {
        cy.log(`\n⚠️ CONCLUSION: Found ${uniqueMissingIds.length} missing content IDs`);
      } else {
        cy.log('\n✅ CONCLUSION: No missing content IDs found in sample');
      }
    });
  });
});