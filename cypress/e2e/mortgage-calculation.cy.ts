describe('Mortgage Calculation Flow', () => {
  // Hebrew test data
  const hebrewTestData = {
    firstName: 'ישראל',
    lastName: 'ישראלי',
    email: 'test@example.com',
    phone: '0501234567',
    id: '123456789',
    address: 'רחוב הרצל 1',
    city: 'תל אביב',
    propertyValue: '2000000',
    loanAmount: '1500000',
    monthlyIncome: '25000',
    smsCode: '123456' // This would need to be dynamic in real scenario
  };

  beforeEach(() => {
    cy.visit('/');
    
    // Set viewport for better visibility
    cy.viewport(1280, 720);
    
    // Clear any existing sessions/cookies
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('completes mortgage calculation flow with Hebrew input', () => {
    // Step 1: Click on the first service (mortgage calculation)
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();

    // Wait for the form to load
    cy.url().should('include', '/calculate-mortgage');
    
    // Step 2: Fill personal information form
    // First Name (Hebrew)
    cy.get('input[name="firstName"], input[placeholder*="שם פרטי"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.firstName);

    // Last Name (Hebrew)
    cy.get('input[name="lastName"], input[placeholder*="שם משפחה"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.lastName);

    // Email
    cy.get('input[type="email"], input[name="email"], input[placeholder*="דוא״ל"], input[placeholder*="אימייל"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.email);

    // Phone
    cy.get('input[type="tel"], input[name="phone"], input[placeholder*="טלפון"], input[placeholder*="נייד"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.phone);

    // ID Number
    cy.get('input[name="id"], input[placeholder*="תעודת זהות"], input[placeholder*="ת.ז"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.id);

    // Address (if exists)
    cy.get('body').then($body => {
      if ($body.find('input[name="address"], input[placeholder*="כתובת"]').length > 0) {
        cy.get('input[name="address"], input[placeholder*="כתובת"]')
          .clear()
          .type(hebrewTestData.address);
      }
    });

    // City (if exists)
    cy.get('body').then($body => {
      if ($body.find('input[name="city"], input[placeholder*="עיר"]').length > 0) {
        cy.get('input[name="city"], input[placeholder*="עיר"]')
          .clear()
          .type(hebrewTestData.city);
      }
    });

    // Click continue button
    cy.get('button').contains(/המשך|continue/i).click();

    // Step 3: Handle SMS Verification (if appears)
    cy.get('body').then($body => {
      // Check if SMS verification popup appears
      if ($body.find('input[placeholder*="קוד"], input[placeholder*="SMS"], input[name="smsCode"]').length > 0) {
        cy.log('SMS verification detected, entering code');
        
        // Enter SMS code
        cy.get('input[placeholder*="קוד"], input[placeholder*="SMS"], input[name="smsCode"]')
          .should('be.visible')
          .clear()
          .type(hebrewTestData.smsCode);
        
        // Click verify/continue
        cy.get('button').contains(/אמת|המשך|verify|continue/i).click();
        
        // Wait for verification to complete
        cy.wait(1000);
      }
    });

    // Step 4: Fill mortgage details (page 2)
    cy.url().should('include', '/calculate-mortgage/2');
    
    // Property Value
    cy.get('input[name="propertyValue"], input[placeholder*="שווי הנכס"], input[placeholder*="ערך הנכס"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.propertyValue);

    // Loan Amount
    cy.get('input[name="loanAmount"], input[placeholder*="סכום הלוואה"], input[placeholder*="גובה המשכנתא"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.loanAmount);

    // Monthly Income
    cy.get('input[name="monthlyIncome"], input[placeholder*="הכנסה חודשית"], input[placeholder*="משכורת"]')
      .should('be.visible')
      .clear()
      .type(hebrewTestData.monthlyIncome);

    // Click continue
    cy.get('button').contains(/המשך|continue/i).click();

    // Step 5: Continue to page 3
    cy.url().should('include', '/calculate-mortgage/3');
    
    // Fill any additional fields on page 3
    // This would depend on what fields are present
    cy.get('input:visible').each(($input) => {
      const placeholder = $input.attr('placeholder') || '';
      if (placeholder && !$input.val()) {
        // Fill with appropriate test data based on field type
        cy.wrap($input).type('test data');
      }
    });

    // Click continue
    cy.get('button').contains(/המשך|continue/i).click();

    // Step 6: Verify we reached page 4
    cy.url().should('include', '/calculate-mortgage/4');
    
    // Verify the final page loaded successfully
    cy.get('body').should('contain.text', /תוצאות|results|חישוב|calculation/i);
  });

  it('handles form validation errors', () => {
    // Navigate to mortgage calculation
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    
    // Try to submit without filling fields
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Verify validation errors appear
    cy.get('.error, .validation-error, [class*="error"]').should('be.visible');
  });

  it('navigates back through the flow', () => {
    // Navigate to mortgage calculation
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    
    // Fill first page and continue
    cy.get('input[name="firstName"], input[placeholder*="שם פרטי"]').type(hebrewTestData.firstName);
    cy.get('input[name="lastName"], input[placeholder*="שם משפחה"]').type(hebrewTestData.lastName);
    cy.get('input[type="email"]').type(hebrewTestData.email);
    cy.get('input[type="tel"]').type(hebrewTestData.phone);
    cy.get('button').contains(/המשך|continue/i).click();
    
    // Go back
    cy.get('button').contains(/חזור|back/i).click();
    
    // Verify we're back on the first page
    cy.url().should('include', '/calculate-mortgage');
    cy.url().should('not.include', '/2');
  });
});

// Custom commands for Hebrew form handling
Cypress.Commands.add('fillHebrewField', (selector: string, value: string) => {
  cy.get(selector)
    .should('be.visible')
    .clear()
    .type(value, { delay: 50 }); // Small delay for Hebrew input
});

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      fillHebrewField(selector: string, value: string): Chainable<void>;
    }
  }
}