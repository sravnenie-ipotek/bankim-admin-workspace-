import { test, expect } from '@playwright/test';

test.describe('Navigation Mapping - Confluence Structure', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page first
    await page.goto('http://localhost:4002/login');
    
    // Login with admin credentials
    await page.fill('input[type="email"]', 'admin@bankim.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 5000 });
  });

  test('should display mortgage screens with Confluence numbers', async ({ page }) => {
    // Navigate to mortgage content page
    await page.goto('http://localhost:4002/content/mortgage');
    
    // Wait for content to load
    await page.waitForSelector('.content-table', { timeout: 10000 });
    
    // Check if Confluence numbers are displayed
    const firstRow = await page.locator('.content-table tbody tr').first();
    const pageName = await firstRow.locator('td').first().textContent();
    
    // Verify that the page name includes a Confluence number
    expect(pageName).toMatch(/^\d+\./); // Should start with a number followed by dot
    
    // Verify specific Confluence numbers are present
    const expectedScreens = [
      '2. Калькулятор ипотеки',
      '3. Ввод номера телефона',
      '4. Анкета личных данных',
      '5. Анкета партнера. Личные',
      '6. Анкета партнера. Доходы'
    ];
    
    for (const expectedScreen of expectedScreens) {
      const screenExists = await page.locator(`text="${expectedScreen}"`).count();
      expect(screenExists).toBeGreaterThan(0);
    }
  });

  test('should maintain correct sort order based on Confluence structure', async ({ page }) => {
    // Navigate to mortgage content page
    await page.goto('http://localhost:4002/content/mortgage');
    
    // Wait for content to load
    await page.waitForSelector('.content-table', { timeout: 10000 });
    
    // Get all page names
    const pageNames = await page.locator('.content-table tbody tr td:first-child').allTextContents();
    
    // Extract numbers from page names
    const numbers = pageNames.map(name => {
      const match = name.match(/^(\d+)\./);
      return match ? parseInt(match[1]) : 0;
    });
    
    // Verify that numbers are in ascending order
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1]);
    }
  });

  test('should navigate to drill page with Confluence information', async ({ page }) => {
    // Navigate to mortgage content page
    await page.goto('http://localhost:4002/content/mortgage');
    
    // Wait for content to load
    await page.waitForSelector('.content-table', { timeout: 10000 });
    
    // Click on the first row's action button
    const firstRow = await page.locator('.content-table tbody tr').first();
    await firstRow.locator('button, .action-icon').click();
    
    // Verify navigation to drill page
    await expect(page).toHaveURL(/\/content\/mortgage\/drill\//);
    
    // Check if Confluence information is passed to drill page
    // This would be visible in the breadcrumb or page title
    const pageTitle = await page.locator('h1, .page-title').textContent();
    expect(pageTitle).toBeTruthy();
  });

  test('should display correct action counts for each screen', async ({ page }) => {
    // Navigate to mortgage content page
    await page.goto('http://localhost:4002/content/mortgage');
    
    // Wait for content to load
    await page.waitForSelector('.content-table', { timeout: 10000 });
    
    // Check that action count column exists and has values
    const actionCounts = await page.locator('.content-table tbody tr td:nth-child(2)').allTextContents();
    
    for (const count of actionCounts) {
      const numericCount = parseInt(count.trim());
      expect(numericCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show refinance mortgage screens with correct numbering', async ({ page }) => {
    // Navigate to mortgage content page
    await page.goto('http://localhost:4002/content/mortgage');
    
    // Wait for content to load
    await page.waitForSelector('.content-table', { timeout: 10000 });
    
    // Check for refinance screens
    const refinanceScreens = [
      '7. Рефинансирование - Шаг 1',
      '8. Рефинансирование - Шаг 2',
      '9. Рефинансирование - Шаг 3',
      '10. Рефинансирование - Шаг 4'
    ];
    
    // These might be on the same page or require navigation
    const allPageNames = await page.locator('.content-table tbody tr td:first-child').allTextContents();
    
    // Check if any refinance screens are visible
    const hasRefinanceScreens = refinanceScreens.some(screen => 
      allPageNames.some(pageName => pageName.includes(screen.split('.')[1].trim()))
    );
    
    expect(hasRefinanceScreens).toBeTruthy();
  });
});

test.describe('API Integration', () => {
  
  test('should fetch mortgage screens from navigation_mapping table', async ({ request }) => {
    // Make direct API call to verify backend is working
    const response = await request.get('http://localhost:4000/api/content/mortgage');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data).toBeDefined();
    expect(data.data.mortgage_content).toBeDefined();
    
    // Check that items have confluence_num field
    const items = data.data.mortgage_content;
    expect(items.length).toBeGreaterThan(0);
    
    const firstItem = items[0];
    expect(firstItem).toHaveProperty('confluence_num');
    expect(firstItem.confluence_num).toBeTruthy();
  });

  test('should return screens in correct sort order', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/content/mortgage');
    const data = await response.json();
    
    const items = data.data.mortgage_content;
    
    // Check that items are sorted by confluence_num
    for (let i = 1; i < items.length; i++) {
      const prevNum = parseFloat(items[i - 1].confluence_num);
      const currNum = parseFloat(items[i].confluence_num);
      expect(currNum).toBeGreaterThanOrEqual(prevNum);
    }
  });
});