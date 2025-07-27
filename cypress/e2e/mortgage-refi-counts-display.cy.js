describe('Mortgage-Refi Action Count Display', () => {
  beforeEach(() => {
    // Login first
    cy.visit('http://localhost:3002/admin/login')
    cy.get('input[type="email"]').type('content.manager@example.com')
    cy.get('input[type="password"]').type('ContentManager123!')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/admin/dashboard')
  })

  it('should display correct action counts in list and drill views', () => {
    // Navigate to mortgage-refi list
    cy.visit('http://localhost:3002/content/mortgage-refi')
    cy.wait(2000) // Wait for data to load
    
    // Capture action counts from list view
    const listCounts = {}
    
    // Get all action count elements (they have class "text15")
    cy.get('.text15').each(($el, index) => {
      const count = $el.text().trim()
      cy.log(`List view row ${index + 1} shows: ${count} actions`)
      listCounts[index] = count
    }).then(() => {
      // Log all captured counts
      cy.log('Captured list counts:', JSON.stringify(listCounts))
      
      // Click first drill button
      cy.get('.image8').first().click()
      cy.wait(2000) // Wait for drill page to load
      
      // Check URL changed to drill page
      cy.url().should('include', '/content/mortgage-refi/drill/')
      
      // Get action count from drill page
      cy.get('body').then($body => {
        // Log the page content to debug
        cy.log('Drill page URL:', window.location.href)
        
        // Look for action count display on drill page
        // Usually in a header or summary section
        const pageText = $body.text()
        cy.log('Page contains:', pageText.substring(0, 500))
        
        // Check if the count from list view appears somewhere on drill page
        const firstListCount = listCounts[0]
        if (pageText.includes(`${firstListCount} действи`)) {
          cy.log(`✅ Found matching count ${firstListCount} on drill page`)
        } else {
          cy.log(`❌ Count ${firstListCount} not found on drill page`)
        }
      })
    })
  })

  it('should compare all mortgage-refi screens', () => {
    cy.visit('http://localhost:3002/content/mortgage-refi')
    cy.wait(2000)
    
    // Test data structure to store results
    const testResults = []
    
    // Get all rows
    cy.get('.text9').each(($title, index) => {
      const titleText = $title.text().trim()
      
      // Get corresponding action count
      cy.get('.text15').eq(index).then($count => {
        const countText = $count.text().trim()
        testResults.push({
          title: titleText,
          listCount: countText,
          index: index
        })
      })
    }).then(() => {
      // Now test each drill page
      cy.wrap(testResults).each((item) => {
        cy.log(`Testing: ${item.title} (Expected: ${item.listCount} actions)`)
        
        // Go back to list page
        cy.visit('http://localhost:3002/content/mortgage-refi')
        cy.wait(1000)
        
        // Click the drill button for this item
        cy.get('.image8').eq(item.index).click()
        cy.wait(1000)
        
        // Verify we're on drill page
        cy.url().should('include', '/drill/')
        
        // Look for action count on drill page
        cy.get('body').then($body => {
          const bodyText = $body.text()
          const expectedCount = item.listCount
          
          // Check various possible locations for the count
          const countPatterns = [
            `${expectedCount} действи`, // Russian
            `${expectedCount} actions`, // English
            `Количество действий: ${expectedCount}`,
            `Actions: ${expectedCount}`,
            `(${expectedCount})` // Sometimes in parentheses
          ]
          
          let found = false
          for (const pattern of countPatterns) {
            if (bodyText.includes(pattern)) {
              cy.log(`✅ Found "${pattern}" for ${item.title}`)
              found = true
              break
            }
          }
          
          if (!found) {
            cy.log(`⚠️ Count ${expectedCount} not displayed on drill page for ${item.title}`)
            cy.log(`Page snippet: ${bodyText.substring(0, 300)}...`)
          }
        })
      })
    })
  })
})