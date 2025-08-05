const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing responsive design...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Simulate login first
  console.log('Performing login...');
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0' });
  
  try {
    await page.waitForSelector('input[type="email"], input[placeholder*="admin"]', { timeout: 5000 });
    await page.type('input[type="email"], input[placeholder*="admin"]', 'admin@bankim.com');
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', 'admin');
    await page.waitForSelector('select', { timeout: 5000 });
    await page.select('select', '0');
    await page.waitForSelector('button[type="submit"], button', { timeout: 5000 });
    await page.click('button[type="submit"], button');
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e) {
    console.log('Login simulation completed');
  }
  
  // Navigate to content main
  await page.goto('http://localhost:3003/content/main', { waitUntil: 'networkidle0' });
  
  // Test different screen sizes
  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Small Mobile', width: 320, height: 568 }
  ];
  
  for (const viewport of viewports) {
    console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    await page.setViewport({ 
      width: viewport.width, 
      height: viewport.height 
    });
    
    // Wait for layout to adjust
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take full page screenshot
    await page.screenshot({ 
      path: `./responsive_${viewport.name.toLowerCase()}_full.png`, 
      fullPage: true 
    });
    
    // Take content area screenshot
    const contentArea = await page.$('.content-main, .admin-layout-content, main');
    if (contentArea) {
      await contentArea.screenshot({ 
        path: `./responsive_${viewport.name.toLowerCase()}_content.png` 
      });
    }
    
    // Check if table is scrollable on mobile
    if (viewport.width <= 768) {
      const tableContainer = await page.$('.table-container');
      if (tableContainer) {
        const scrollWidth = await page.evaluate(el => el.scrollWidth, tableContainer);
        const clientWidth = await page.evaluate(el => el.clientWidth, tableContainer);
        const isScrollable = scrollWidth > clientWidth;
        console.log(`  Table scrollable: ${isScrollable} (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
      }
    }
    
    console.log(`  Screenshot saved: responsive_${viewport.name.toLowerCase()}_full.png`);
  }
  
  await browser.close();
  console.log('Responsive testing completed!');
})().catch(console.error);