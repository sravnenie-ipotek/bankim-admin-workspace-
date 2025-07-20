const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing color consistency...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewport({ width: 375, height: 667 });
  
  // Simulate login
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
  
  // Take screenshot to verify color consistency
  await page.screenshot({ 
    path: './color_consistency_test.png', 
    fullPage: true 
  });
  
  console.log('Color consistency screenshot saved: color_consistency_test.png');
  
  // Check if the navigation and sidebar have matching backgrounds
  const navBg = await page.evaluate(() => {
    const nav = document.querySelector('#root > div > div > div.admin-main-content > nav > div, #root > div > div > div.admin-main-content > nav');
    const navClasses = nav ? nav.className : 'no nav classes';
    const navStyle = nav ? getComputedStyle(nav).backgroundColor : 'nav not found';
    return { background: navStyle, classes: navClasses };
  });
  
  const sidebarBg = await page.evaluate(() => {
    const sidebar = document.querySelector('#root > div > div > div.admin-sidebar-wrapper > div > div.content, #root > div > div > div.admin-sidebar-wrapper > div');
    const sidebarClasses = sidebar ? sidebar.className : 'no sidebar classes';
    const sidebarStyle = sidebar ? getComputedStyle(sidebar).backgroundColor : 'sidebar not found';
    return { background: sidebarStyle, classes: sidebarClasses };
  });
  
  console.log('Navigation:', navBg);
  console.log('Sidebar:', sidebarBg);
  
  // Check specifically for TopNavigation component
  const topNavBg = await page.evaluate(() => {
    const topNav = document.querySelector('.top-navigation');
    const topNavClasses = topNav ? topNav.className : 'no top-nav classes';
    const topNavStyle = topNav ? getComputedStyle(topNav).backgroundColor : 'top-navigation not found';
    return { background: topNavStyle, classes: topNavClasses };
  });
  
  console.log('TopNavigation:', topNavBg);
  
  await browser.close();
  console.log('Color testing completed!');
})().catch(console.error);