describe('Admin Portal Navigation Test - All Links Except Content Management', () => {
  let testResults: Array<{
    section: string;
    link: string;
    status: 'pass' | 'fail';
    error?: string;
    url?: string;
    statusCode?: number;
  }> = [];

  before(() => {
    // Visit the admin portal
    cy.visit('http://185.253.72.80:3002');
    
    // Wait for the page to load
    cy.wait(2000);
    
    // Handle potential authentication if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="login-form"]').length > 0) {
        // If login form exists, perform login
        cy.get('[data-cy="email-input"]').type('admin@bankimonline.com');
        cy.get('[data-cy="password-input"]').type('admin123');
        cy.get('[data-cy="login-button"]').click();
        cy.wait(3000);
      }
    });
  });

  describe('Navigation Menu Testing', () => {
    const menuSections = [
      {
        name: 'Формула калькулятора',
        selector: '[data-cy="calculator-formula"]',
        subItems: []
      },
      {
        name: 'Чат',
        selector: '[data-cy="chat"]',
        subItems: []
      },
      {
        name: 'Пользователи',
        selector: '[data-cy="users"]',
        subItems: [
          'Управление пользователями',
          'Роли и разрешения',
          'Активные сессии'
        ]
      },
      {
        name: 'Аналитика',
        selector: '[data-cy="analytics"]',
        subItems: [
          'Dashboard',
          'Отчеты',
          'Статистика пользователей',
          'Конверсия'
        ]
      },
      {
        name: 'Настройки',
        selector: '[data-cy="settings"]',
        subItems: [
          'Общие настройки',
          'Конфигурация API',
          'Безопасность',
          'Интеграции'
        ]
      },
      {
        name: 'Банки',
        selector: '[data-cy="banks"]',
        subItems: [
          'Список банков',
          'Настройки банков',
          'API конфигурация'
        ]
      },
      {
        name: 'Системные логи',
        selector: '[data-cy="system-logs"]',
        subItems: [
          'Журнал событий',
          'Ошибки системы',
          'Аудит действий'
        ]
      }
    ];

    menuSections.forEach((section) => {
      it(`Should test ${section.name} section`, () => {
        // Test main menu item
        cy.get('body').then(() => {
          cy.get(section.selector, { timeout: 10000 })
            .should('exist')
            .then(($element) => {
              // Check if element is visible and clickable
              if ($element.is(':visible')) {
                cy.wrap($element).click({ force: true });
                
                // Wait for navigation
                cy.wait(1500);
                
                // Check for errors on the page
                cy.get('body').then(($body) => {
                  let hasError = false;
                  let errorMessage = '';
                  let currentUrl = '';
                  
                  cy.url().then((url) => {
                    currentUrl = url;
                    
                    // Check for common error indicators
                    const errorSelectors = [
                      '.error',
                      '.error-message',
                      '[data-cy="error"]',
                      '.alert-danger',
                      '.notification-error'
                    ];
                    
                    errorSelectors.forEach(selector => {
                      if ($body.find(selector).length > 0 && $body.find(selector).is(':visible')) {
                        hasError = true;
                        errorMessage += $body.find(selector).text() + ' ';
                      }
                    });
                    
                    // Check for development placeholder (expected for non-content sections)
                    const isDevelopmentPage = $body.find(':contains("В разработке")').length > 0 ||
                                            $body.find(':contains("Phase 2")').length > 0 ||
                                            $body.find('.in-development').length > 0;
                    
                    // Check console errors
                    cy.window().then((win) => {
                      const consoleErrors = (win as any).__cypressConsoleErrors || [];
                      if (consoleErrors.length > 0) {
                        hasError = true;
                        errorMessage += `Console errors: ${consoleErrors.join(', ')}`;
                      }
                    });
                    
                    // Record test result
                    testResults.push({
                      section: section.name,
                      link: 'Main Menu',
                      status: hasError && !isDevelopmentPage ? 'fail' : 'pass',
                      error: hasError && !isDevelopmentPage ? errorMessage.trim() : undefined,
                      url: currentUrl,
                      statusCode: undefined
                    });
                    
                    if (hasError && !isDevelopmentPage) {
                      cy.log(`❌ Error found in ${section.name}: ${errorMessage}`);
                    } else {
                      cy.log(`✅ ${section.name} - ${isDevelopmentPage ? 'Development placeholder shown correctly' : 'No errors found'}`);
                    }
                  });
                });
              } else {
                testResults.push({
                  section: section.name,
                  link: 'Main Menu',
                  status: 'fail',
                  error: 'Menu item not visible',
                  url: '',
                  statusCode: undefined
                });
              }
            });
        });

        // Test submenu items if they exist
        if (section.subItems.length > 0) {
          section.subItems.forEach((subItem, index) => {
            it(`Should test ${section.name} -> ${subItem}`, () => {
              // Navigate back to main menu if needed
              cy.get('body').then(() => {
                const subSelector = `${section.selector}-sub-${index}`;
                
                cy.get(subSelector, { timeout: 5000 }).then(($subElement) => {
                  if ($subElement.length > 0 && $subElement.is(':visible')) {
                    cy.wrap($subElement).click({ force: true });
                    cy.wait(1500);
                    
                    cy.get('body').then(($body) => {
                      let hasError = false;
                      let errorMessage = '';
                      let currentUrl = '';
                      
                      cy.url().then((url) => {
                        currentUrl = url;
                        
                        // Check for errors
                        const errorSelectors = [
                          '.error',
                          '.error-message',
                          '[data-cy="error"]',
                          '.alert-danger',
                          '.notification-error'
                        ];
                        
                        errorSelectors.forEach(selector => {
                          if ($body.find(selector).length > 0 && $body.find(selector).is(':visible')) {
                            hasError = true;
                            errorMessage += $body.find(selector).text() + ' ';
                          }
                        });
                        
                        const isDevelopmentPage = $body.find(':contains("В разработке")').length > 0 ||
                                                $body.find(':contains("Phase 2")').length > 0;
                        
                        testResults.push({
                          section: section.name,
                          link: subItem,
                          status: hasError && !isDevelopmentPage ? 'fail' : 'pass',
                          error: hasError && !isDevelopmentPage ? errorMessage.trim() : undefined,
                          url: currentUrl,
                          statusCode: undefined
                        });
                      });
                    });
                  } else {
                    testResults.push({
                      section: section.name,
                      link: subItem,
                      status: 'fail',
                      error: 'Submenu item not found or not visible',
                      url: '',
                      statusCode: undefined
                    });
                  }
                }).catch(() => {
                  testResults.push({
                    section: section.name,
                    link: subItem,
                    status: 'fail',
                    error: 'Submenu item selector not found',
                    url: '',
                    statusCode: undefined
                  });
                });
              });
            });
          });
        }
      });
    });
  });

  describe('Generic Link Testing (Fallback)', () => {
    it('Should test all clickable links that are not in Content Management', () => {
      // Get all clickable elements that might be navigation links
      cy.get('body').find('a, button, [role="button"], .nav-item, .menu-item')
        .not(':contains("Контент сайта")')
        .not(':contains("Content")')
        .not('[href*="content"]')
        .not('[data-cy*="content"]')
        .each(($element, index) => {
          const elementText = $element.text().trim();
          const elementHref = $element.attr('href');
          const elementClass = $element.attr('class');
          
          // Skip if element is not visible or is empty
          if (!elementText || !$element.is(':visible')) {
            return;
          }
          
          // Skip known content-related elements
          const skipPatterns = [
            'контент',
            'content',
            'содержимое',
            'материалы'
          ];
          
          const shouldSkip = skipPatterns.some(pattern => 
            elementText.toLowerCase().includes(pattern) ||
            (elementHref && elementHref.toLowerCase().includes(pattern)) ||
            (elementClass && elementClass.toLowerCase().includes(pattern))
          );
          
          if (shouldSkip) {
            return;
          }
          
          cy.wrap($element).then(() => {
            cy.wrap($element).click({ force: true });
            cy.wait(1000);
            
            cy.get('body').then(($body) => {
              let hasError = false;
              let errorMessage = '';
              let currentUrl = '';
              
              cy.url().then((url) => {
                currentUrl = url;
                
                // Check for errors
                const errorSelectors = [
                  '.error',
                  '.error-message',
                  '[data-cy="error"]',
                  '.alert-danger',
                  '.notification-error',
                  '.error-boundary'
                ];
                
                errorSelectors.forEach(selector => {
                  if ($body.find(selector).length > 0 && $body.find(selector).is(':visible')) {
                    hasError = true;
                    errorMessage += $body.find(selector).text() + ' ';
                  }
                });
                
                // Check for 404 or other error pages
                if ($body.find(':contains("404")').length > 0 || 
                    $body.find(':contains("Not Found")').length > 0 ||
                    $body.find(':contains("Страница не найдена")').length > 0) {
                  hasError = true;
                  errorMessage += 'Page not found (404) ';
                }
                
                const isDevelopmentPage = $body.find(':contains("В разработке")').length > 0 ||
                                        $body.find(':contains("Phase 2")').length > 0;
                
                testResults.push({
                  section: 'Generic Links',
                  link: elementText || `Element ${index}`,
                  status: hasError && !isDevelopmentPage ? 'fail' : 'pass',
                  error: hasError && !isDevelopmentPage ? errorMessage.trim() : undefined,
                  url: currentUrl,
                  statusCode: undefined
                });
              });
            });
          });
        });
    });
  });

  after(() => {
    // Generate comprehensive report
    cy.task('log', '\n🏦 BANKIM ADMIN PORTAL NAVIGATION TEST REPORT');
    cy.task('log', '═══════════════════════════════════════════════════');
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'pass').length;
    const failedTests = testResults.filter(r => r.status === 'fail').length;
    
    cy.task('log', `📊 SUMMARY:`);
    cy.task('log', `   Total Links Tested: ${totalTests}`);
    cy.task('log', `   ✅ Passed: ${passedTests}`);
    cy.task('log', `   ❌ Failed: ${failedTests}`);
    cy.task('log', `   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    cy.task('log', '');
    
    // Group results by section
    const sections = [...new Set(testResults.map(r => r.section))];
    
    sections.forEach(section => {
      const sectionResults = testResults.filter(r => r.section === section);
      const sectionPassed = sectionResults.filter(r => r.status === 'pass').length;
      const sectionFailed = sectionResults.filter(r => r.status === 'fail').length;
      
      cy.task('log', `📂 ${section} (${sectionPassed}/${sectionResults.length} passed):`);
      
      sectionResults.forEach(result => {
        const status = result.status === 'pass' ? '✅' : '❌';
        cy.task('log', `   ${status} ${result.link}`);
        
        if (result.error) {
          cy.task('log', `      Error: ${result.error}`);
        }
        
        if (result.url) {
          cy.task('log', `      URL: ${result.url}`);
        }
      });
      cy.task('log', '');
    });
    
    // Failed tests details
    const failedResults = testResults.filter(r => r.status === 'fail');
    if (failedResults.length > 0) {
      cy.task('log', '🚨 FAILED TESTS DETAILS:');
      cy.task('log', '───────────────────────────');
      
      failedResults.forEach((result, index) => {
        cy.task('log', `${index + 1}. ${result.section} -> ${result.link}`);
        cy.task('log', `   Error: ${result.error}`);
        cy.task('log', `   URL: ${result.url}`);
        cy.task('log', '');
      });
    }
    
    // Recommendations
    cy.task('log', '💡 RECOMMENDATIONS:');
    cy.task('log', '──────────────────');
    
    if (failedTests === 0) {
      cy.task('log', '🎉 All tests passed! Admin portal navigation is working correctly.');
    } else {
      cy.task('log', `⚠️  ${failedTests} issues found that need attention:`);
      
      failedResults.forEach(result => {
        if (result.error?.includes('404') || result.error?.includes('Not Found')) {
          cy.task('log', `   • Fix broken link: ${result.section} -> ${result.link}`);
        } else if (result.error?.includes('not visible')) {
          cy.task('log', `   • Check UI visibility: ${result.section} -> ${result.link}`);
        } else {
          cy.task('log', `   • Debug error: ${result.section} -> ${result.link}`);
        }
      });
    }
    
    cy.task('log', '');
    cy.task('log', '📅 Test completed at: ' + new Date().toISOString());
    cy.task('log', '═══════════════════════════════════════════════════');
    
    // Write results to JSON file for further analysis
    cy.writeFile('cypress/reports/navigation-test-results.json', {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1)
      },
      results: testResults,
      recommendations: failedResults.map(r => ({
        section: r.section,
        link: r.link,
        issue: r.error,
        action: r.error?.includes('404') ? 'Fix broken link' : 
                r.error?.includes('not visible') ? 'Check UI visibility' : 'Debug error'
      }))
    });
  });
});