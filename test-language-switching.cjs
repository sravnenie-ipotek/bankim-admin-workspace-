const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to QA Language test page
    console.log('Navigating to QA Language test page...');
    await page.goto('http://localhost:3003/qa-language');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'language-test-initial.png' });
    console.log('Initial screenshot saved');
    
    // Get initial language state
    const initialLang = await page.textContent('.qa-info-item:has-text("Active Language")');
    console.log('Initial state:', initialLang);
    
    // Test Hebrew language
    console.log('\nSwitching to Hebrew...');
    await page.click('button:has-text("🇮🇱 Hebrew")');
    await page.waitForTimeout(1000);
    
    const hebrewLang = await page.textContent('.qa-info-item:has-text("Active Language")');
    const hebrewDir = await page.textContent('.qa-info-item:has-text("Direction")');
    console.log('Hebrew state:', hebrewLang);
    console.log('Direction:', hebrewDir);
    
    // Check if any translations changed
    const hebrewSaveBtn = await page.textContent('.qa-ui-examples button:first-child');
    console.log('Save button in Hebrew:', hebrewSaveBtn);
    
    // Test English language
    console.log('\nSwitching to English...');
    await page.click('button:has-text("🇺🇸 English")');
    await page.waitForTimeout(1000);
    
    const englishLang = await page.textContent('.qa-info-item:has-text("Active Language")');
    console.log('English state:', englishLang);
    
    const englishSaveBtn = await page.textContent('.qa-ui-examples button:first-child');
    console.log('Save button in English:', englishSaveBtn);
    
    // Check translation test results
    console.log('\nChecking translation test results...');
    const testResults = await page.$$eval('.qa-table tbody tr', rows => 
      rows.map(row => ({
        key: row.querySelector('code').textContent,
        translation: row.querySelector('td:nth-child(2)').textContent,
        status: row.querySelector('.qa-status').textContent
      }))
    );
    
    console.log('Translation test results:');
    testResults.forEach(result => {
      console.log(`  ${result.key}: ${result.translation} - ${result.status}`);
    });
    
    // Check if localStorage is being updated
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('preferredLanguage');
    });
    console.log('\nlocalStorage preferredLanguage:', localStorage);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\nTest complete. Browser will remain open for inspection.');
    console.log('Close the browser window manually when done.');
  }
})();