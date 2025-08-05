describe('Basic Application Load Test', () => {
  it('should load the application without errors', () => {
    cy.visit('/');
    
    // Wait for the page to load
    cy.get('body').should('be.visible');
    
    // Check that we're redirected (could be to content-management or another route)
    cy.url().should('not.equal', Cypress.config().baseUrl + '/');
    
    // Check that the page doesn't have critical errors
    cy.get('body').should('not.contain', 'Something went wrong');
    cy.get('body').should('not.contain', 'Error');
    
    // Check that React has rendered something
    cy.get('#root').should('not.be.empty');
  });
  
  it('should load content management section', () => {
    cy.visit('/content-management');
    
    // Basic check that page loads
    cy.get('body').should('be.visible');
    cy.get('#root').should('not.be.empty');
  });
  
  it('should access API health endpoint', () => {
    cy.request('GET', 'http://localhost:4000/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'healthy');
    });
  });
});