/**
 * Content Verification Automation - Playwright Implementation
 * Comprehensive testing of content sections and action count verification
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class ContentVerificationAutomation {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://localhost:4003';
    this.verificationResults = [];
    this.contentSections = [
      'main',
      'mortgage', 
      'mortgage-refi',
      'credit',
      'credit-refi',
      'general',
      'menu'
    ];
  }

  async login() {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.fill('input[type="email"]', 'admin@bankim.com');
    await this.page.fill('input[type="password"]', 'admin123');
    await this.page.selectOption('select', 'director');
    await this.page.click('button[type="submit"]');
    
    // Wait for login to complete
    await this.page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
  }

  async extractOverviewCounts(section) {
    console.log(`📊 Extracting overview counts for section: ${section}`);
    
    await this.page.goto(`${this.baseUrl}/content/${section}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for content to load
    await this.page.waitForTimeout(2000);
    
    const overviewCounts = {};
    
    // Multiple selectors to find table rows
    const selectors = [
      'table tbody tr',
      '[data-testid="content-table"] tr',
      '.content-table tr',
      '.content-row',
      'tr:has(td)'
    ];
    
    for (const selector of selectors) {
      const rows = await this.page.locator(selector).count();
      
      if (rows > 0) {
        console.log(`Found ${rows} rows using selector: ${selector}`);
        
        for (let i = 0; i < rows; i++) {
          const row = this.page.locator(selector).nth(i);
          const cells = row.locator('td, .cell, [data-cell]');
          const cellCount = await cells.count();
          
          if (cellCount >= 2) {
            const pageName = await cells.nth(0).textContent();
            const actionCountText = await cells.nth(1).textContent();
            const actionCount = parseInt(actionCountText?.trim()) || 0;
            
            if (pageName?.trim() && actionCount > 0) {
              overviewCounts[pageName.trim()] = actionCount;
              console.log(`${section} Overview - ${pageName.trim()}: ${actionCount} actions`);
            }
          }
        }
        break; // Stop after finding working selector
      }
    }
    
    return overviewCounts;
  }

  async verifyDrillPageCounts(section, overviewCounts) {
    console.log(`🔍 Verifying drill page counts for section: ${section}`);
    
    const pageNames = Object.keys(overviewCounts);
    
    if (pageNames.length === 0) {
      console.log(`⚠️ No pages found in ${section} overview`);
      return;
    }
    
    for (let i = 0; i < pageNames.length; i++) {
      const pageName = pageNames[i];
      const expectedCount = overviewCounts[pageName];
      
      // Try different URL patterns for drill pages
      const drillUrls = [
        `${this.baseUrl}/content/${section}/drill/${pageName}`,
        `${this.baseUrl}/content/${section}/drill/${pageName.toLowerCase()}`,
        `${this.baseUrl}/content/${section}/drill/${i + 1}`,
        `${this.baseUrl}/content/${section}/drill/page${i + 1}`,
        `${this.baseUrl}/content/${section}/drill/${encodeURIComponent(pageName)}`
      ];
      
      let drillPageFound = false;
      let actualCount = 0;
      let workingUrl = '';
      
      for (const drillUrl of drillUrls) {
        try {
          console.log(`Trying drill URL: ${drillUrl}`);
          
          const response = await this.page.goto(drillUrl, { 
            waitUntil: 'networkidle',
            timeout: 10000 
          });
          
          if (response.status() !== 404) {
            await this.page.waitForTimeout(1000);
            
            const bodyText = await this.page.textContent('body');
            
            if (!bodyText.includes('404') && !bodyText.includes('Not Found')) {
              drillPageFound = true;
              workingUrl = drillUrl;
              
              // Count actions on drill page using multiple strategies
              actualCount = await this.countActionsOnPage();
              
              console.log(`✅ Found drill page at: ${drillUrl}`);
              console.log(`Actions found: ${actualCount}`);
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Failed to load: ${drillUrl}`);
          continue;
        }
      }
      
      // Record result
      const result = {
        section,
        pageName,
        expectedCount,
        actualCount,
        match: expectedCount === actualCount,
        drillPageFound,
        workingUrl,
        timestamp: new Date().toISOString()
      };
      
      this.verificationResults.push(result);
      
      if (drillPageFound) {
        console.log(`${section} - ${pageName}: Expected ${expectedCount}, Found ${actualCount} ${result.match ? '✅' : '❌'}`);
      } else {
        console.log(`${section} - ${pageName}: Drill page not found ❌`);
      }
    }
  }

  async countActionsOnPage() {
    // Multiple strategies to count actions
    const actionSelectors = [
      '.action-item',
      '[data-testid="action"]',
      '.content-action',
      '.form-field',
      '.input-field',
      '.action-row',
      'tr[data-action]',
      '[class*="action"]',
      '.field-container',
      '.content-item',
      '.edit-field'
    ];
    
    let maxCount = 0;
    
    for (const selector of actionSelectors) {
      const count = await this.page.locator(selector).count();
      if (count > maxCount) {
        maxCount = count;
        console.log(`Best count found with selector "${selector}": ${count}`);
      }
    }
    
    // Also try counting table rows (excluding headers)
    const tableRowCount = await this.page.locator('table tbody tr, .data-table tr:not(.header)').count();
    if (tableRowCount > maxCount) {
      maxCount = tableRowCount;
      console.log(`Table row count: ${tableRowCount}`);
    }
    
    return maxCount;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSections: this.contentSections.length,
        totalPages: this.verificationResults.length,
        successfulMatches: this.verificationResults.filter(r => r.match).length,
        failedMatches: this.verificationResults.filter(r => !r.match).length,
        pagesNotFound: this.verificationResults.filter(r => !r.drillPageFound).length
      },
      results: this.verificationResults,
      recommendations: this.generateRecommendations()
    };
    
    // Save to JSON file
    const reportPath = path.join(__dirname, 'content-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    const htmlPath = path.join(__dirname, 'content-verification-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    
    console.log(`📊 Verification complete! Reports saved:`);
    console.log(`📄 JSON: ${reportPath}`);
    console.log(`🌐 HTML: ${htmlPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const failedMatches = this.verificationResults.filter(r => !r.match && r.drillPageFound);
    if (failedMatches.length > 0) {
      recommendations.push({
        type: 'count_mismatch',
        message: `${failedMatches.length} pages have count mismatches between overview and drill pages`,
        pages: failedMatches.map(r => `${r.section}/${r.pageName}`)
      });
    }
    
    const notFound = this.verificationResults.filter(r => !r.drillPageFound);
    if (notFound.length > 0) {
      recommendations.push({
        type: 'drill_pages_missing',
        message: `${notFound.length} drill pages could not be accessed`,
        pages: notFound.map(r => `${r.section}/${r.pageName}`)
      });
    }
    
    return recommendations;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Content Verification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .match-yes { background-color: #d4edda; }
        .match-no { background-color: #f8d7da; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Content Verification Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Sections:</strong> ${report.summary.totalSections}</p>
        <p><strong>Total Pages:</strong> ${report.summary.totalPages}</p>
        <p class="success"><strong>Successful Matches:</strong> ${report.summary.successfulMatches}</p>
        <p class="error"><strong>Failed Matches:</strong> ${report.summary.failedMatches}</p>
        <p class="warning"><strong>Pages Not Found:</strong> ${report.summary.pagesNotFound}</p>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Section</th>
                <th>Page Name</th>
                <th>Expected Count</th>
                <th>Actual Count</th>
                <th>Match</th>
                <th>Drill Page Found</th>
                <th>Working URL</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map(result => `
                <tr class="${result.match ? 'match-yes' : 'match-no'}">
                    <td>${result.section}</td>
                    <td>${result.pageName}</td>
                    <td>${result.expectedCount}</td>
                    <td>${result.actualCount}</td>
                    <td>${result.match ? '✅' : '❌'}</td>
                    <td>${result.drillPageFound ? '✅' : '❌'}</td>
                    <td><small>${result.workingUrl || 'N/A'}</small></td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            ${report.recommendations.map(rec => `
                <h3>${rec.type}</h3>
                <p>${rec.message}</p>
                <ul>
                    ${rec.pages.map(page => `<li>${page}</li>`).join('')}
                </ul>
            `).join('')}
        </div>
    ` : ''}
</body>
</html>`;
  }
}

// Test suite
test.describe('Content Verification Automation', () => {
  let automation;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    automation = new ContentVerificationAutomation(page);
    await automation.login();
  });

  test('should run comprehensive content verification', async () => {
    for (const section of automation.contentSections) {
      console.log(`\n🔍 Processing section: ${section}`);
      
      // Extract overview counts
      const overviewCounts = await automation.extractOverviewCounts(section);
      
      // Verify drill page counts
      await automation.verifyDrillPageCounts(section, overviewCounts);
    }
    
    // Generate final report
    const report = await automation.generateReport();
    
    // Assertions for test results
    expect(report.summary.totalPages).toBeGreaterThan(0);
    
    // Log summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`Total Pages: ${report.summary.totalPages}`);
    console.log(`Successful Matches: ${report.summary.successfulMatches}`);
    console.log(`Failed Matches: ${report.summary.failedMatches}`);
    console.log(`Pages Not Found: ${report.summary.pagesNotFound}`);
  });

  test('should verify navigation accessibility', async () => {
    for (const section of automation.contentSections) {
      const response = await automation.page.goto(`${automation.baseUrl}/content/${section}`);
      expect(response.status()).not.toBe(404);
      
      const url = automation.page.url();
      expect(url).toContain(`/content/${section}`);
      
      console.log(`✅ ${section} section is accessible`);
    }
  });
});