import { mortgageHelpers } from '../support/mortgage-helpers';

describe('Advanced Mortgage Calculation Flow', () => {
  // Test configuration
  const testConfig = {
    baseUrl: 'http://localhost:4002',
    defaultTimeout: 10000,
    smsTimeout: 30000
  };

  // Hebrew test data
  const userData = {
    firstName: 'דוד',
    lastName: 'כהן',
    email: `test${Date.now()}@example.com`, // Unique email for each test
    phone: '0521234567',
    id: '325698741',
    address: 'רוטשילד 10',
    city: 'תל אביב',
    propertyValue: '2500000',
    loanAmount: '1750000',
    monthlyIncome: '35000',
    years: '25'
  };

  before(() => {
    // Set up intercepts for API calls
    mortgageHelpers.interceptSmsVerification();
  });

  beforeEach(() => {
    // Visit the application
    cy.visit('/', { timeout: testConfig.defaultTimeout });
    
    // Clear session data
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
    
    // Set viewport
    cy.viewport(1366, 768);
  });

  it('completes full mortgage calculation flow with Hebrew inputs and SMS verification', () => {
    // Step 1: Navigate to mortgage calculation service
    cy.log('Step 1: Navigating to mortgage calculation');
    
    // Wait for services to load
    cy.get('._services_u982a_1', { timeout: testConfig.defaultTimeout })
      .should('be.visible');
    
    // Click on the first service (mortgage calculation)
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();

    // Verify navigation
    cy.url().should('include', '/calculate-mortgage');
    
    // Step 2: Fill personal information (Page 1)
    cy.log('Step 2: Filling personal information');
    
    // Use custom commands for Hebrew fields
    cy.fillHebrewField('firstName', userData.firstName);
    cy.fillHebrewField('lastName', userData.lastName);
    cy.fillHebrewField('email', userData.email);
    cy.fillHebrewField('phone', userData.phone);
    cy.fillHebrewField('id', userData.id);
    
    // Fill optional fields if present
    cy.get('body').then($body => {
      if ($body.find('input[name="address"]').length > 0) {
        cy.fillHebrewField('address', userData.address);
      }
      if ($body.find('input[name="city"]').length > 0) {
        cy.fillHebrewField('city', userData.city);
      }
    });

    // Screenshot before continuing
    cy.screenshot('01-personal-info-filled');
    
    // Click continue
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Step 3: Handle SMS Verification
    cy.log('Step 3: Handling SMS verification');
    
    // Check if SMS verification appears
    cy.get('body').then($body => {
      const hasSmsField = $body.find('input[placeholder*="קוד"], input[placeholder*="SMS"]').length > 0;
      
      if (hasSmsField) {
        cy.log('SMS verification detected');
        
        // Wait for SMS field to be ready
        cy.wait(1000);
        
        // Use custom command to handle SMS
        const smsCode = mortgageHelpers.getSmsCode();
        cy.handleSmsVerification(smsCode);
        
        // Wait for verification to complete
        cy.wait('@verifySms', { timeout: testConfig.smsTimeout }).then((interception) => {
          cy.log('SMS verification completed');
        });
      }
    });
    
    // Step 4: Fill mortgage details (Page 2)
    cy.log('Step 4: Filling mortgage details');
    
    // Wait for page 2 to load
    mortgageHelpers.waitForMortgagePage(2);
    
    // Fill mortgage details
    cy.fillHebrewField('propertyValue', userData.propertyValue);
    cy.fillHebrewField('loanAmount', userData.loanAmount);
    cy.fillHebrewField('monthlyIncome', userData.monthlyIncome);
    
    // Fill loan period if present
    cy.get('body').then($body => {
      if ($body.find('input[name="years"], select[name="years"]').length > 0) {
        if ($body.find('select[name="years"]').length > 0) {
          cy.get('select[name="years"]').select(userData.years);
        } else {
          cy.fillHebrewField('years', userData.years);
        }
      }
    });
    
    // Screenshot of mortgage details
    cy.screenshot('02-mortgage-details-filled');
    
    // Continue to next page
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Step 5: Complete additional information (Page 3)
    cy.log('Step 5: Completing additional information');
    
    // Wait for page 3
    mortgageHelpers.waitForMortgagePage(3);
    
    // Fill any additional required fields
    cy.get('input[required]:visible, select[required]:visible').each(($el) => {
      const tagName = $el.prop('tagName').toLowerCase();
      const type = $el.attr('type');
      
      if (tagName === 'input' && type !== 'submit' && type !== 'button') {
        if (!$el.val()) {
          cy.wrap($el).type('נתון בדיקה'); // "Test data" in Hebrew
        }
      } else if (tagName === 'select') {
        cy.wrap($el).select(1); // Select first real option
      }
    });
    
    // Screenshot of additional info
    cy.screenshot('03-additional-info-filled');
    
    // Continue to results
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Step 6: Verify calculation results (Page 4)
    cy.log('Step 6: Verifying calculation results');
    
    // Wait for page 4
    mortgageHelpers.waitForMortgagePage(4);
    
    // Verify results are displayed
    mortgageHelpers.verifyCalculationResults();
    
    // Take screenshot of results
    cy.screenshot('04-calculation-results');
    
    // Log success
    cy.log('Mortgage calculation completed successfully!');
  });

  it('validates required fields', () => {
    // Navigate to mortgage calculation
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    
    // Try to continue without filling fields
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Check for validation messages
    cy.get('.error-message, .field-error, [class*="error"], :invalid')
      .should('exist')
      .and('be.visible');
    
    // Verify we're still on page 1
    cy.url().should('include', '/calculate-mortgage');
    cy.url().should('not.include', '/2');
  });

  it('allows navigation between form pages', () => {
    // Navigate to mortgage calculation
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    
    // Fill and go to page 2
    cy.fillHebrewField('firstName', userData.firstName);
    cy.fillHebrewField('lastName', userData.lastName);
    cy.fillHebrewField('email', userData.email);
    cy.fillHebrewField('phone', userData.phone);
    cy.fillHebrewField('id', userData.id);
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Skip SMS if it appears
    cy.handleSmsVerification('123456');
    
    // Should be on page 2
    cy.url().should('include', '/calculate-mortgage/2');
    
    // Go back to page 1
    cy.get('button').contains(/חזור|הקודם|back|previous/i).click();
    
    // Verify we're back on page 1
    cy.url().should('include', '/calculate-mortgage');
    cy.url().should('not.include', '/2');
    
    // Verify form data is preserved
    cy.get('input[name="firstName"]').should('have.value', userData.firstName);
  });

  after(() => {
    // Clean up any test data if needed
    cy.log('Test suite completed');
  });
});