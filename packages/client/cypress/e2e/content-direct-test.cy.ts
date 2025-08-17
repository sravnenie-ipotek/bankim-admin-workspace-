describe('Direct Content Test', () => {
  it('should directly test the /content/main page', () => {
    // Set auth before visiting
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-token');
      win.localStorage.setItem('userRole', 'Director');
    });

    // Visit with auth check disabled
    cy.visit('http://localhost:4002/content/main', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
      }
    });
    
    // Check URL - if redirected to login, we have auth issue
    cy.url().then(url => {
      console.log('Current URL:', url);
      if (url.includes('login')) {
        cy.log('Redirected to login - auth issue');
      }
    });
    
    // Try to find any content
    cy.get('body').then($body => {
      const text = $body.text();
      cy.log('Body text:', text.substring(0, 500));
    });
  });

  it('should check mortgage drill with better error handling', () => {
    // Set auth 
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-token');
      win.localStorage.setItem('userRole', 'Director');
    });

    cy.visit('http://localhost:4002/content/mortgage', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
      }
    });
    
    // Wait and check what's on the page
    cy.wait(2000);
    
    // Try to navigate to drill
    cy.visit('http://localhost:4002/content/mortgage/drill/mortgage_step1', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
      }
    });
    
    // Check console logs
    cy.window().then((win) => {
      console.log('Window console logs available');
    });
  });
});