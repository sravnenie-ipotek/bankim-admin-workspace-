#!/usr/bin/env python3
"""
Browser Automation Demo using Playwright
Demonstrates basic browser automation capabilities
"""

import asyncio
from playwright.async_api import async_playwright
import time

async def demo_browser_automation():
    """
    Demonstrates browser automation capabilities with Playwright
    """
    print("🚀 Starting Browser Automation Demo...")
    
    async with async_playwright() as p:
        # Launch browser (Chromium)
        print("📱 Launching Chromium browser...")
        browser = await p.chromium.launch(
            headless=False,  # Set to False to see the browser window
            slow_mo=1000     # Slow down actions by 1 second for visibility
        )
        
        # Create a new page
        print("📄 Creating new browser page...")
        page = await browser.new_page()
        
        # Set viewport size
        await page.set_viewport_size({"width": 1280, "height": 720})
        
        print("🌐 Navigating to example website...")
        # Navigate to a basic webpage
        await page.goto("https://example.com")
        
        # Take a screenshot
        print("📸 Taking screenshot...")
        await page.screenshot(path="demo_screenshot.png")
        
        # Get page title
        title = await page.title()
        print(f"📋 Page title: {title}")
        
        # Get page URL
        url = page.url
        print(f"🔗 Current URL: {url}")
        
        # Find and interact with elements
        print("🔍 Finding page elements...")
        
        # Get the main heading
        heading = await page.locator("h1").first.text_content()
        print(f"📜 Main heading: {heading}")
        
        # Get all paragraphs
        paragraphs = await page.locator("p").all_text_contents()
        print(f"📝 Found {len(paragraphs)} paragraphs")
        
        # Demonstrate navigation
        print("🌐 Navigating to httpbin.org for more demos...")
        await page.goto("https://httpbin.org")
        
        # Wait for page to load
        await page.wait_for_load_state("networkidle")
        
        # Get page content info
        title2 = await page.title()
        print(f"📋 New page title: {title2}")
        
        # Click on a link if available
        print("🖱️  Looking for links to interact with...")
        try:
            # Try to find and click a link
            link = page.locator("a").first
            if await link.count() > 0:
                link_text = await link.text_content()
                print(f"🔗 Found link: {link_text}")
                await link.click()
                await page.wait_for_load_state("networkidle")
                print(f"✅ Successfully clicked link and loaded: {page.url}")
        except Exception as e:
            print(f"ℹ️  No clickable links found or interaction failed: {e}")
        
        # Demonstrate form interaction
        print("📝 Demonstrating form interaction...")
        await page.goto("https://httpbin.org/forms/post")
        
        # Fill out a simple form
        try:
            await page.fill('input[name="custname"]', "Demo User")
            await page.fill('input[name="custtel"]', "123-456-7890")
            await page.fill('input[name="custemail"]', "demo@example.com")
            await page.select_option('select[name="size"]', "medium")
            print("✅ Form filled successfully")
            
            # Take another screenshot
            await page.screenshot(path="form_demo_screenshot.png")
            print("📸 Form screenshot saved")
            
        except Exception as e:
            print(f"ℹ️  Form interaction demo failed: {e}")
        
        # Wait a moment to see the results
        print("⏳ Waiting 3 seconds before closing...")
        await asyncio.sleep(3)
        
        print("🔒 Closing browser...")
        await browser.close()
        
    print("✅ Browser automation demo completed successfully!")
    print("📁 Screenshots saved to:")
    print("   - demo_screenshot.png")
    print("   - form_demo_screenshot.png")

if __name__ == "__main__":
    # Run the demo
    asyncio.run(demo_browser_automation())