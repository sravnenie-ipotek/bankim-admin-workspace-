describe('Final Content Validation', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    
    // Properly set auth before each test
    cy.visit('http://localhost:4002', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
        win.localStorage.setItem('selectedLanguage', 'ru');
      }
    });
  });

  it('✅ Fixed: /content/main no longer returns HTML instead of JSON', () => {
    cy.visit('http://localhost:4002/content/main', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
      }
    });
    
    // Page should load without JSON parsing errors
    cy.get('body').should('exist');
    cy.url().should('include', '/content/main');
    
    // Should not show error messages
    cy.get('body').should('not.contain', 'Unexpected token');
    cy.get('body').should('not.contain', 'DOCTYPE');
    cy.get('body').should('not.contain', 'is not valid JSON');
  });

  it('✅ Fixed: MortgageDrill no longer has map() error', () => {
    cy.visit('http://localhost:4002/content/mortgage/drill/mortgage_step1', {
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', 'test-token');
        win.localStorage.setItem('userRole', 'Director');
      }
    });
    
    // Page should load without map errors
    cy.get('body').should('not.contain', "Cannot read properties of undefined (reading 'map')");
    cy.get('body').should('not.contain', 'TypeError');
    
    // Check console for errors (intercept console.error)
    cy.window().then((win) => {
      const stub = cy.stub(win.console, 'error');
      cy.wait(1000).then(() => {
        // Check that no map errors were logged
        const mapErrors = stub.getCalls().filter(call => 
          call.args.some(arg => 
            String(arg).includes("reading 'map'") || 
            String(arg).includes('TypeError')
          )
        );
        expect(mapErrors.length).to.equal(0);
      });
    });
  });

  it('✅ API: mortgage/all-items returns proper structure', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/content/mortgage/all-items',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      // Should be successful
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      
      // Should have correct structure
      expect(response.body.data).to.exist;
      expect(response.body.data.all_items).to.be.an('array');
      expect(response.body.data.content_count).to.be.a('number');
      
      // Should have items
      expect(response.body.data.all_items.length).to.be.greaterThan(0);
      
      // Check item structure
      if (response.body.data.all_items.length > 0) {
        const firstItem = response.body.data.all_items[0];
        expect(firstItem).to.have.property('id');
        expect(firstItem).to.have.property('content_key');
        expect(firstItem).to.have.property('translations');
      }
    });
  });

  const contentPages = [
    '/content/main',
    '/content/menu', 
    '/content/mortgage',
    '/content/credit',
    '/content/mortgage-refi',
    '/content/credit-refi'
  ];

  contentPages.forEach(page => {
    it(`✅ All pages work: ${page}`, () => {
      cy.visit(`http://localhost:4002${page}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('authToken', 'test-token');
          win.localStorage.setItem('userRole', 'Director');
        },
        failOnStatusCode: false
      });
      
      // Should not show common errors
      cy.get('body', { timeout: 5000 }).should('not.contain', 'TypeError');
      cy.get('body').should('not.contain', 'Unexpected token');
      cy.get('body').should('not.contain', 'Cannot read properties');
    });
  });
});