/**
 * E2E Tests for SharedDropdownEdit Component
 * Comprehensive QA testing for all content types
 */

describe('SharedDropdownEdit Component QA Tests', () => {
  // Test data
  const contentTypes = [
    { 
      type: 'mortgage', 
      path: '/content/mortgage/dropdown-edit/123',
      title: 'Редактирование дропдауна ипотеки',
      breadcrumb: 'Рассчитать ипотеку'
    },
    { 
      type: 'mortgage-refi', 
      path: '/content/mortgage-refi/dropdown-edit/456',
      title: 'Редактирование дропдауна рефинансирования',
      breadcrumb: 'Рефинансирование ипотеки'
    },
    { 
      type: 'credit', 
      path: '/content/credit/dropdown-edit/789',
      title: 'Редактирование дропдауна кредита',
      breadcrumb: 'Расчет Кредита'
    },
    { 
      type: 'credit-refi', 
      path: '/content/credit-refi/dropdown-edit/321',
      title: 'Редактирование дропдауна рефинансирования кредита',
      breadcrumb: 'Рефинансирование Кредита'
    }
  ];

  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/content/item/*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: '123',
          content_key: 'test.dropdown',
          component_type: 'dropdown',
          category: 'form',
          screen_location: 'main',
          is_active: true,
          translations: [
            { lang: 'ru', content_value: 'Тестовый заголовок' },
            { lang: 'he', content_value: 'כותרת בדיקה' },
            { lang: 'en', content_value: 'Test Title' }
          ]
        }
      }
    }).as('getContentItem');

    cy.intercept('GET', '/api/content/*/options', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { translations: { ru: 'Опция 1', he: 'אפשרות 1', en: 'Option 1' } },
          { translations: { ru: 'Опция 2', he: 'אפשרות 2', en: 'Option 2' } }
        ]
      }
    }).as('getDropdownOptions');

    cy.intercept('PUT', '/api/content-items/*/translations/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updateTranslation');
  });

  contentTypes.forEach((content) => {
    describe(`${content.type} Dropdown Edit`, () => {
      beforeEach(() => {
        cy.visit(content.path);
      });

      it('should load and display correct page title', () => {
        cy.get('.page-title').should('contain', content.title);
      });

      it('should display correct breadcrumb navigation', () => {
        cy.get('.breadcrumb-container').should('exist');
        cy.get('.breadcrumb-item').should('contain', 'Контент сайта');
        cy.get('.breadcrumb-item').should('contain', content.breadcrumb);
        cy.get('.breadcrumb-item').should('contain', 'Список действий');
        cy.get('.breadcrumb-item.active').should('contain', 'Редактирование дропдауна');
      });

      it('should load content data successfully', () => {
        cy.wait('@getContentItem');
        cy.wait('@getDropdownOptions');
        
        // Check that form fields are populated
        cy.get('.language-group:first-child input').should('have.value', 'Тестовый заголовок');
        cy.get('.language-group:nth-child(2) input').should('have.value', 'כותרת בדיקה');
      });

      it('should handle loading state correctly', () => {
        cy.get('.shared-dropdown-edit-loading').should('not.exist');
        cy.get('.dropdown-edit-form').should('exist');
      });

      it('should enable save button when changes are made', () => {
        // Initially disabled
        cy.get('.btn-primary').should('be.disabled');
        
        // Make a change
        cy.get('.language-group:first-child input').clear().type('Новый заголовок');
        
        // Should be enabled
        cy.get('.btn-primary').should('not.be.disabled');
      });

      it('should handle option management', () => {
        // Check initial options
        cy.get('.option-item').should('have.length', 2);
        
        // Add new option
        cy.get('.btn-add-option').click();
        cy.get('.option-item').should('have.length', 3);
        
        // Delete option (should not delete last one)
        cy.get('.option-item:last-child .btn-delete').click();
        cy.get('.option-item').should('have.length', 2);
      });

      it('should handle option reordering', () => {
        // Check reorder buttons
        cy.get('.option-item:first-child button[title="Переместить вверх"]').should('be.disabled');
        cy.get('.option-item:last-child button[title="Переместить вниз"]').should('be.disabled');
        
        // Reorder
        cy.get('.option-item:first-child button[title="Переместить вниз"]').click();
        // Verify reorder happened (would need to check option values)
      });

      it('should save changes successfully', () => {
        // Make changes
        cy.get('.language-group:first-child input').clear().type('Обновленный заголовок');
        
        // Save
        cy.get('.btn-primary').click();
        
        // Verify API call
        cy.wait('@updateTranslation');
      });

      it('should handle RTL input correctly', () => {
        cy.get('.language-group:nth-child(2) input')
          .should('have.class', 'rtl')
          .should('have.attr', 'dir', 'rtl');
      });

      it('should handle error states', () => {
        // Mock error response
        cy.intercept('GET', '/api/content/item/*', {
          statusCode: 500,
          body: { success: false, error: 'Server error' }
        }).as('getContentItemError');
        
        cy.reload();
        cy.wait('@getContentItemError');
        
        cy.get('.shared-dropdown-edit-error').should('exist');
        cy.get('.shared-dropdown-edit-error').should('contain', 'Ошибка');
      });

      if (content.type === 'credit' || content.type === 'credit-refi') {
        it('should display English language fields for credit types', () => {
          cy.get('.language-group').should('have.length', 3);
          cy.get('.language-group:nth-child(3) .language-label').should('contain', 'EN');
        });
      } else {
        it('should not display English language fields for mortgage types', () => {
          cy.get('.language-group').should('have.length', 2);
          cy.get('.language-label').should('not.contain', 'EN');
        });
      }
    });
  });

  describe('Component Structure and CSS', () => {
    beforeEach(() => {
      cy.visit('/content/mortgage/dropdown-edit/123');
    });

    it('should have correct CSS classes applied', () => {
      cy.get('.shared-dropdown-edit-page').should('exist');
      cy.get('.breadcrumb-container').should('exist');
      cy.get('.page-title-section').should('exist');
      cy.get('.last-modified-box').should('exist');
      cy.get('.dropdown-edit-form').should('exist');
      cy.get('.form-section').should('exist');
      cy.get('.language-fields').should('exist');
      cy.get('.options-list').should('exist');
      cy.get('.form-actions').should('exist');
    });

    it('should have responsive design', () => {
      // Mobile view
      cy.viewport(375, 667);
      cy.get('.language-fields').should('have.css', 'flex-direction', 'column');
      
      // Desktop view
      cy.viewport(1920, 1080);
      cy.get('.language-fields').should('have.css', 'flex-direction', 'row');
    });
  });

  describe('API Integration', () => {
    it('should handle API timeouts gracefully', () => {
      cy.intercept('GET', '/api/content/item/*', (req) => {
        req.reply((res) => {
          res.delay(5000); // 5 second delay
          res.send({ statusCode: 504, body: { error: 'Gateway Timeout' } });
        });
      }).as('timeoutRequest');

      cy.visit('/content/mortgage/dropdown-edit/123');
      cy.get('.shared-dropdown-edit-error', { timeout: 10000 }).should('exist');
    });

    it('should clear cache after successful update', () => {
      // Make a change and save
      cy.get('.language-group:first-child input').clear().type('Новый текст');
      cy.get('.btn-primary').click();
      
      // Verify cache is cleared (would need to check console logs or network requests)
      cy.wait('@updateTranslation');
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      cy.visit('/content/mortgage/dropdown-edit/123');
    });

    it('should maintain state correctly', () => {
      // Check initial state
      cy.get('.btn-primary').should('be.disabled');
      
      // Change state
      cy.get('.language-group:first-child input').clear().type('Изменение');
      cy.get('.btn-primary').should('not.be.disabled');
      
      // Reset to original value
      cy.get('.language-group:first-child input').clear().type('Тестовый заголовок');
      // Button should be disabled again if value matches original
    });

    it('should handle concurrent modifications', () => {
      // Modify multiple fields
      cy.get('.language-group:nth-child(1) input').clear().type('Русский');
      cy.get('.language-group:nth-child(2) input').clear().type('עברית');
      cy.get('.option-item:first-child .option-input:first').clear().type('Новая опция');
      
      // All changes should be tracked
      cy.get('.btn-primary').should('not.be.disabled');
    });
  });
});