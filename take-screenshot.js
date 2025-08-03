import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1400, height: 1000 });
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:3002/content/mortgage/dropdown-edit/1513', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'final-background-fix.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved successfully');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
  
  await browser.close();
})();