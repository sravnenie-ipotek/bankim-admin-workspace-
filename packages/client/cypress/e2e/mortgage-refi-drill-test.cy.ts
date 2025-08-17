describe('Mortgage Refinancing Drill Pages Test', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    
    // Set auth token
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-token');
      win.localStorage.setItem('userRole', 'Director');
      win.localStorage.setItem('selectedLanguage', 'ru');
    });
  });

  it('should display all 4 refinancing steps on main page', () => {
    cy.visit('http://localhost:4002/content/mortgage-refi');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Check that all 4 steps are visible
    cy.contains('1. Рефинансирование ипотеки').should('be.visible');
    cy.contains('2. Личная информация').should('be.visible');
    cy.contains('3. Доходы и занятость').should('be.visible');
    cy.contains('4. Результаты и выбор').should('be.visible');
    
    // Verify action counts
    cy.get('tr').contains('Рефинансирование ипотеки').parent().within(() => {
      cy.contains('38').should('exist'); // Step 1 has 38 real actions
    });
  });

  it('should navigate to drill page for step 1 and show 38 actions', () => {
    cy.visit('http://localhost:4002/content/mortgage-refi');
    cy.wait(2000);
    
    // Click on step 1
    cy.contains('1. Рефинансирование ипотеки').click();
    
    // Should navigate to drill page
    cy.url().should('include', '/content/mortgage-refi/drill/refinance_mortgage_1');
    
    // Check that actions are displayed
    cy.wait(2000);
    
    // Should show action count in info card
    cy.get('.info-card').contains('Номер действия').parent().within(() => {
      cy.get('.info-value').should('exist');
    });
    
    // Should have table with actions
    cy.get('.table-row').should('have.length.greaterThan', 0);
  });

  it('should show placeholder message for step 2 (Личная информация)', () => {
    cy.visit('http://localhost:4002/content/mortgage-refi');
    cy.wait(2000);
    
    // Click on step 2
    cy.contains('2. Личная информация').click();
    
    // Should navigate to drill page
    cy.url().should('include', '/content/mortgage-refi/drill/refinance_mortgage_2');
    
    // Should show placeholder message
    cy.wait(2000);
    cy.contains('еще не настроен').should('be.visible');
    cy.contains('Этот шаг будет доступен после добавления контента').should('be.visible');
    
    // Should have back button
    cy.contains('Вернуться назад').should('be.visible');
  });

  it('should show placeholder message for step 3 (Доходы и занятость)', () => {
    cy.visit('http://localhost:4002/content/mortgage-refi');
    cy.wait(2000);
    
    // Click on step 3
    cy.contains('3. Доходы и занятость').click();
    
    // Should navigate to drill page
    cy.url().should('include', '/content/mortgage-refi/drill/refinance_mortgage_3');
    
    // Should show placeholder message
    cy.wait(2000);
    cy.contains('еще не настроен').should('be.visible');
    
    // Should have back button
    cy.contains('Вернуться назад').should('be.visible');
  });

  it('should show placeholder message for step 4 (Результаты и выбор)', () => {
    cy.visit('http://localhost:4002/content/mortgage-refi');
    cy.wait(2000);
    
    // Click on step 4
    cy.contains('4. Результаты и выбор').click();
    
    // Should navigate to drill page
    cy.url().should('include', '/content/mortgage-refi/drill/refinance_mortgage_4');
    
    // Should show placeholder message
    cy.wait(2000);
    cy.contains('еще не настроен').should('be.visible');
    
    // Should have back button
    cy.contains('Вернуться назад').should('be.visible');
  });

  it('should navigate back from drill pages correctly', () => {
    // Test step 1 back navigation
    cy.visit('http://localhost:4002/content/mortgage-refi/drill/refinance_mortgage_1');
    cy.wait(2000);
    cy.contains('Вернуться назад').click();
    cy.url().should('include', '/content/mortgage-refi');
    
    // Test step 2 back navigation
    cy.visit('http://localhost:4002/content/mortgage-refi/drill/refinance_mortgage_2');
    cy.wait(2000);
    cy.contains('Вернуться назад').click();
    cy.url().should('include', '/content/mortgage-refi');
  });

  it('should test the API endpoints directly', () => {
    // Test main endpoint
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/content/mortgage-refi',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.mortgage_refi_items).to.have.length(4);
    });

    // Test drill endpoint for step 1
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/content/mortgage-refi/drill/refinance_mortgage_1',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.action_count).to.equal(38);
    });

    // Test drill endpoints for placeholder steps
    const placeholderSteps = ['refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4'];
    placeholderSteps.forEach(step => {
      cy.request({
        method: 'GET',
        url: `http://localhost:4000/api/content/mortgage-refi/drill/${step}`,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
        expect(response.body.data.is_placeholder).to.be.true;
        expect(response.body.data.actions).to.have.length(0);
      });
    });
  });
});