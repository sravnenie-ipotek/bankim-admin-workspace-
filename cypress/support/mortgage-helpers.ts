// Helper functions for mortgage calculation tests

export const mortgageHelpers = {
  // Mock SMS verification
  interceptSmsVerification: () => {
    cy.intercept('POST', '**/api/sms/send', {
      statusCode: 200,
      body: { success: true, message: 'SMS sent' }
    }).as('sendSms');

    cy.intercept('POST', '**/api/sms/verify', {
      statusCode: 200,
      body: { success: true, token: 'mock-auth-token' }
    }).as('verifySms');
  },

  // Wait for page navigation
  waitForMortgagePage: (pageNumber: number) => {
    cy.url().should('include', `/calculate-mortgage/${pageNumber}`);
    cy.wait(500); // Small wait for page render
  },

  // Fill Hebrew form with better selectors
  fillHebrewForm: (data: any) => {
    // Helper to type in Hebrew fields with proper handling
    const typeHebrewText = (selector: string, text: string) => {
      cy.get(selector)
        .should('be.visible')
        .click()
        .clear()
        .type(text, { delay: 100 });
    };

    // Try multiple selector strategies
    const fillField = (fieldName: string, value: string) => {
      const selectors = [
        `input[name="${fieldName}"]`,
        `input[id="${fieldName}"]`,
        `input[data-testid="${fieldName}"]`,
        `input[placeholder*="${fieldName}"]`
      ];

      cy.get('body').then($body => {
        for (const selector of selectors) {
          if ($body.find(selector).length > 0) {
            typeHebrewText(selector, value);
            break;
          }
        }
      });
    };

    // Fill each field
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        fillField(key, value);
      }
    });
  },

  // Handle dynamic SMS code (in real scenario, this would read from email/SMS service)
  getSmsCode: (): string => {
    // In a real test, this would:
    // 1. Connect to email/SMS service API
    // 2. Retrieve the latest SMS
    // 3. Extract the code using regex
    // For now, return a mock code
    return '123456';
  },

  // Verify calculation results
  verifyCalculationResults: () => {
    cy.get('[data-testid="calculation-results"], .calculation-results, .results-container')
      .should('be.visible');
    
    // Check for key result elements
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('תשלום חודשי') || 
             text.includes('Monthly Payment') ||
             text.includes('ריבית') ||
             text.includes('Interest Rate');
    });
  }
};

// Hebrew field mappings
export const hebrewFieldMappings = {
  firstName: ['שם פרטי', 'שם', 'first name'],
  lastName: ['שם משפחה', 'משפחה', 'last name'],
  email: ['דוא"ל', 'אימייל', 'דואר אלקטרוני', 'email'],
  phone: ['טלפון', 'נייד', 'מספר טלפון', 'phone'],
  id: ['תעודת זהות', 'ת.ז', 'מספר זהות', 'id'],
  address: ['כתובת', 'רחוב', 'address'],
  city: ['עיר', 'יישוב', 'city'],
  propertyValue: ['שווי הנכס', 'ערך הנכס', 'שווי', 'property value'],
  loanAmount: ['סכום הלוואה', 'גובה המשכנתא', 'סכום משכנתא', 'loan amount'],
  monthlyIncome: ['הכנסה חודשית', 'משכורת', 'הכנסה', 'income']
};

// Generate selector for Hebrew fields
export const getHebrewFieldSelector = (fieldName: string): string => {
  const mappings = hebrewFieldMappings[fieldName as keyof typeof hebrewFieldMappings] || [];
  const selectors = mappings.map(text => `input[placeholder*="${text}"]`).join(', ');
  return `input[name="${fieldName}"], ${selectors}`;
};