describe('BankIM Management Portal Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the home page', () => {
    cy.contains('h1', 'Welcome to BankIM Management Portal');
    cy.contains('Please select your role to continue');
  });

  it('navigates to Director page', () => {
    cy.contains('Director').click();
    cy.url().should('include', '/director');
    cy.contains('h1', 'Director Dashboard');
  });

  it('navigates to Administration page', () => {
    cy.contains('Administration').click();
    cy.url().should('include', '/administration');
    cy.contains('h1', 'Administration Panel');
  });

  it('navigates to Sales Manager page', () => {
    cy.contains('Sales Manager').click();
    cy.url().should('include', '/sales-manager');
    cy.contains('h1', 'Sales Manager Dashboard');
  });

  it('navigates to Bank Employee page', () => {
    cy.contains('Bank Employee').click();
    cy.url().should('include', '/bank-employee');
    cy.contains('h1', 'Bank Employee Portal');
  });

  it('navigates to Content Manager page', () => {
    cy.contains('Content Manager').click();
    cy.url().should('include', '/content-manager');
    cy.contains('h1', 'Content Manager Dashboard');
  });

  it('navigates to Brokers page', () => {
    cy.contains('Brokers').click();
    cy.url().should('include', '/brokers');
    cy.contains('h1', 'Brokers Portal');
  });

  it('navigates back to home from any page', () => {
    cy.contains('Sales Manager').click();
    cy.contains('BankIM Portal').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});