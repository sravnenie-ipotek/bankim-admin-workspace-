describe('Quick Content Pages Check', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    
    // Set auth token
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-token');
      win.localStorage.setItem('userRole', 'admin');
      win.localStorage.setItem('selectedLanguage', 'ru');
    });
  });

  it('should load /content/main without JSON error', () => {
    cy.visit('http://localhost:4002/content/main');
    
    // Should not show JSON parsing error
    cy.get('body', { timeout: 5000 }).should('not.contain', 'Unexpected token');
    cy.get('body').should('not.contain', 'DOCTYPE');
    cy.get('body').should('not.contain', 'is not valid JSON');
    
    // Should show some content
    cy.contains('Главная').should('exist');
  });

  it('should load mortgage drill pages without map error', () => {
    cy.visit('http://localhost:4002/content/mortgage/drill/mortgage_step1');
    
    // Should not show map error
    cy.get('body', { timeout: 5000 }).should('not.contain', 'TypeError');
    cy.get('body').should('not.contain', "Cannot read properties of undefined (reading 'map')");
    
    // Should show content or loading indicator
    cy.get('.drill-container, .loading-spinner, .content-list').should('exist');
  });

  it('should fetch mortgage all-items API successfully', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/content/mortgage/all-items',
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false
    }).then((response) => {
      // Should return JSON
      expect(response.headers['content-type']).to.include('application/json');
      
      // Should have correct structure
      expect(response.body).to.have.property('success');
      if (response.body.success) {
        expect(response.body.data).to.have.property('all_items');
        expect(response.body.data.all_items).to.be.an('array');
      }
    });
  });
});