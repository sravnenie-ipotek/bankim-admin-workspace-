describe('All Content Pages Comprehensive Test', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    
    // Set auth token
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-token');
      win.localStorage.setItem('userRole', 'admin');
      win.localStorage.setItem('selectedLanguage', 'ru');
    });
  });

  const contentPages = [
    { path: '/content/main', name: 'Main Content', expectedTitle: 'Главная страница' },
    { path: '/content/menu', name: 'Menu Content', expectedTitle: 'Меню' },
    { path: '/content/mortgage', name: 'Mortgage Content', expectedTitle: 'Ипотека' },
    { path: '/content/credit', name: 'Credit Content', expectedTitle: 'Кредиты' },
    { path: '/content/mortgage-refi', name: 'Mortgage Refinancing', expectedTitle: 'Рефинансирование ипотеки' },
    { path: '/content/credit-refi', name: 'Credit Refinancing', expectedTitle: 'Рефинансирование кредитов' },
  ];

  contentPages.forEach(page => {
    it(`should load ${page.name} page without errors`, () => {
      // Visit the page
      cy.visit(`http://localhost:4002${page.path}`);
      
      // Wait for page to load
      cy.wait(1000);
      
      // Check that the page loaded (no error messages)
      cy.get('body').should('not.contain', 'Ошибка загрузки');
      cy.get('body').should('not.contain', 'Error loading');
      cy.get('body').should('not.contain', 'Unexpected token');
      cy.get('body').should('not.contain', 'DOCTYPE');
      
      // Check for page title or content
      if (page.expectedTitle) {
        cy.contains(page.expectedTitle).should('be.visible');
      }
      
      // Check that API calls don't return HTML
      cy.intercept('GET', '/api/**').as('apiCall');
      
      // Reload to trigger API calls
      cy.reload();
      
      // Wait for any API calls and verify they return JSON
      cy.wait('@apiCall', { timeout: 10000 }).then((interception) => {
        if (interception.response) {
          const contentType = interception.response.headers['content-type'];
          expect(contentType).to.include('application/json');
          expect(interception.response.body).to.not.include('<!DOCTYPE');
        }
      });
    });
  });

  // Test specific drill-down pages
  const drillPages = [
    { path: '/content/mortgage/drill/mortgage_step1', name: 'Mortgage Step 1 Drill' },
    { path: '/content/mortgage/drill/mortgage_step2', name: 'Mortgage Step 2 Drill' },
    { path: '/content/mortgage/drill/mortgage_step3', name: 'Mortgage Step 3 Drill' },
    { path: '/content/mortgage/drill/mortgage_step4', name: 'Mortgage Step 4 Drill' },
    { path: '/content/credit/drill/credit_step1', name: 'Credit Step 1 Drill' },
    { path: '/content/credit/drill/credit_step2', name: 'Credit Step 2 Drill' },
    { path: '/content/credit/drill/credit_step3', name: 'Credit Step 3 Drill' },
    { path: '/content/mortgage-refi/drill/refinance_mortgage_1', name: 'Mortgage Refi Step 1' },
    { path: '/content/mortgage-refi/drill/refinance_mortgage_2', name: 'Mortgage Refi Step 2' },
    { path: '/content/credit-refi/drill/refinance_credit_1', name: 'Credit Refi Step 1' },
    { path: '/content/credit-refi/drill/refinance_credit_2', name: 'Credit Refi Step 2' },
  ];

  drillPages.forEach(page => {
    it(`should load ${page.name} without map errors`, () => {
      // Visit the drill page
      cy.visit(`http://localhost:4002${page.path}`);
      
      // Wait for page to load
      cy.wait(2000);
      
      // Check console for specific errors
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });
      
      // Check that the page loaded without the specific map error
      cy.get('body').should('not.contain', 'TypeError');
      cy.get('body').should('not.contain', 'Cannot read properties');
      cy.get('body').should('not.contain', 'reading \'map\'');
      
      // Check for loading or content
      cy.get('.loading-spinner, .drill-container, .content-list').should('exist');
    });
  });

  // Test navigation from main pages to drill pages
  it('should navigate from Mortgage to drill pages', () => {
    cy.visit('http://localhost:4002/content/mortgage');
    cy.wait(2000);
    
    // Try to click on a drill link if available
    cy.get('a[href*="/drill/"], button:contains("Шаг")').first().then($el => {
      if ($el.length > 0) {
        cy.wrap($el).click();
        cy.wait(1000);
        cy.url().should('include', '/drill/');
        cy.get('body').should('not.contain', 'TypeError');
      }
    });
  });

  // Test the mortgage all-items endpoint
  it('should fetch mortgage all items without errors', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/content/mortgage/all-items',
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      // Check response is JSON
      expect(response.headers['content-type']).to.include('application/json');
      
      // Check response structure
      expect(response.body).to.have.property('success');
      
      if (response.body.success) {
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('all_items');
        
        // Check all_items is an array
        expect(response.body.data.all_items).to.be.an('array');
      }
    });
  });
});