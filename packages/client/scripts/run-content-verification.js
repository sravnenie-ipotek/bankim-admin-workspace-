#!/usr/bin/env node

/**
 * Content Verification Automation Runner
 * Runs both Cypress and Playwright content verification tests
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class ContentVerificationRunner {
  constructor() {
    this.reports = [];
    this.startTime = Date.now();
  }

  async runAll() {
    console.log('🚀 Starting Content Verification Automation\n');
    
    // Check if servers are running
    await this.checkServers();
    
    // Run Cypress tests
    console.log('📊 Running Cypress Content Verification...');
    await this.runCypress();
    
    // Run Playwright tests  
    console.log('🎭 Running Playwright Content Verification...');
    await this.runPlaywright();
    
    // Generate combined report
    this.generateCombinedReport();
    
    console.log('✅ Content verification complete!');
  }

  async checkServers() {
    console.log('🔍 Checking server status...');
    
    const checkServer = (url, name) => {
      return new Promise((resolve) => {
        exec(`curl -s -o /dev/null -w "%{http_code}" ${url}`, (error, stdout) => {
          const status = stdout.trim();
          if (status === '200' || status.startsWith('2')) {
            console.log(`✅ ${name} is running (${url})`);
            resolve(true);
          } else {
            console.log(`❌ ${name} is not responding (${url})`);
            resolve(false);
          }
        });
      });
    };
    
    const clientRunning = await checkServer('http://localhost:4003', 'Client');
    const serverRunning = await checkServer('http://localhost:4000/api/health', 'Server');
    
    if (!clientRunning || !serverRunning) {
      console.log('\n⚠️  Please ensure both client and server are running:');
      console.log('   Client: npm run dev --workspace=@bankim/client');
      console.log('   Server: npm run dev --workspace=@bankim/server');
      process.exit(1);
    }
    
    console.log('');
  }

  runCypress() {
    return new Promise((resolve, reject) => {
      const cypress = spawn('npx', ['cypress', 'run', '--spec', 'cypress/e2e/content-verification-automation.cy.js'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      cypress.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Cypress tests completed successfully\n');
          this.loadCypressReport();
        } else {
          console.log('⚠️ Cypress tests completed with issues\n');
        }
        resolve();
      });
      
      cypress.on('error', (error) => {
        console.error('❌ Cypress failed to start:', error);
        resolve(); // Continue with Playwright even if Cypress fails
      });
    });
  }

  runPlaywright() {
    return new Promise((resolve, reject) => {
      const playwright = spawn('npx', ['playwright', 'test', 'tests/content-verification-playwright.spec.js'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      playwright.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Playwright tests completed successfully\n');
        } else {
          console.log('⚠️ Playwright tests completed with issues\n');
        }
        this.loadPlaywrightReport();
        resolve();
      });
      
      playwright.on('error', (error) => {
        console.error('❌ Playwright failed to start:', error);
        resolve();
      });
    });
  }

  loadCypressReport() {
    try {
      const reportPath = path.join(process.cwd(), 'cypress', 'reports', 'content-verification-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.reports.push({ tool: 'Cypress', ...report });
        console.log('📄 Cypress report loaded');
      }
    } catch (error) {
      console.log('⚠️ Could not load Cypress report');
    }
  }

  loadPlaywrightReport() {
    try {
      const reportPath = path.join(process.cwd(), 'tests', 'content-verification-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.reports.push({ tool: 'Playwright', ...report });
        console.log('📄 Playwright report loaded');
      }
    } catch (error) {
      console.log('⚠️ Could not load Playwright report');
    }
  }

  generateCombinedReport() {
    const duration = Date.now() - this.startTime;
    
    const combinedReport = {
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      tools: this.reports.map(r => r.tool),
      overallSummary: this.calculateOverallSummary(),
      toolReports: this.reports,
      recommendations: this.generateCombinedRecommendations()
    };
    
    // Save combined JSON report
    const reportPath = path.join(process.cwd(), 'content-verification-combined-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(combinedReport, null, 2));
    
    // Generate combined HTML report
    const htmlReport = this.generateCombinedHtmlReport(combinedReport);
    const htmlPath = path.join(process.cwd(), 'content-verification-combined-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    
    // Print summary
    console.log('📊 COMBINED VERIFICATION SUMMARY:');
    console.log('================================');
    console.log(`Tools Used: ${combinedReport.tools.join(', ')}`);
    console.log(`Duration: ${combinedReport.duration}`);
    console.log(`Overall Success Rate: ${combinedReport.overallSummary.successRate}%`);
    console.log(`Total Checks: ${combinedReport.overallSummary.totalChecks}`);
    console.log(`Successful: ${combinedReport.overallSummary.totalSuccess}`);
    console.log(`Failed: ${combinedReport.overallSummary.totalFailed}`);
    console.log('');
    console.log('📄 Reports generated:');
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    if (this.reports.length > 0) {
      console.log('');
      console.log('📈 Individual Tool Reports:');
      this.reports.forEach(report => {
        console.log(`   ${report.tool}: ${report.summary?.successfulMatches || 0}/${report.summary?.totalResults || 0} passed`);
      });
    }
  }

  calculateOverallSummary() {
    let totalChecks = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    
    this.reports.forEach(report => {
      if (report.summary) {
        totalChecks += report.summary.totalResults || 0;
        totalSuccess += report.summary.successfulMatches || 0;
        totalFailed += report.summary.failedMatches || 0;
      }
    });
    
    const successRate = totalChecks > 0 ? Math.round((totalSuccess / totalChecks) * 100) : 0;
    
    return {
      totalChecks,
      totalSuccess,
      totalFailed,
      successRate
    };
  }

  generateCombinedRecommendations() {
    const allRecommendations = [];
    
    this.reports.forEach(report => {
      if (report.recommendations) {
        report.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            source: report.tool
          });
        });
      }
    });
    
    return allRecommendations;
  }

  generateCombinedHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>🎯 Combined Content Verification Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; font-size: 1.1em; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .success { color: #28a745; }
        .danger { color: #dc3545; }
        .info { color: #17a2b8; }
        .warning { color: #ffc107; }
        .tool-reports { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .tool-report { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .tool-header { padding: 20px; background: #343a40; color: white; }
        .tool-content { padding: 20px; }
        .recommendations { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .match-yes { background-color: #d4edda; }
        .match-no { background-color: #f8d7da; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; font-weight: 500; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Combined Content Verification Report</h1>
            <p>Comprehensive testing results from multiple automation tools</p>
            <p><strong>Generated:</strong> ${report.timestamp} | <strong>Duration:</strong> ${report.duration}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Overall Success Rate</h3>
                <div class="number ${report.overallSummary.successRate >= 80 ? 'success' : report.overallSummary.successRate >= 60 ? 'warning' : 'danger'}">${report.overallSummary.successRate}%</div>
            </div>
            <div class="summary-card">
                <h3>Total Checks</h3>
                <div class="number info">${report.overallSummary.totalChecks}</div>
            </div>
            <div class="summary-card">
                <h3>Successful</h3>
                <div class="number success">${report.overallSummary.totalSuccess}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number danger">${report.overallSummary.totalFailed}</div>
            </div>
            <div class="summary-card">
                <h3>Tools Used</h3>
                <div class="number info">${report.tools.length}</div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #6c757d;">${report.tools.join(', ')}</p>
            </div>
        </div>
        
        <div class="tool-reports">
            ${report.toolReports.map(toolReport => `
                <div class="tool-report">
                    <div class="tool-header">
                        <h2>${toolReport.tool} Results</h2>
                        <p>Generated: ${toolReport.timestamp}</p>
                    </div>
                    <div class="tool-content">
                        ${toolReport.summary ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 20px;">
                                <div>
                                    <strong>Total Results</strong><br>
                                    <span style="font-size: 1.5em; color: #17a2b8;">${toolReport.summary.totalResults || 0}</span>
                                </div>
                                <div>
                                    <strong>Successful</strong><br>
                                    <span style="font-size: 1.5em; color: #28a745;">${toolReport.summary.successfulMatches || 0}</span>
                                </div>
                                <div>
                                    <strong>Failed</strong><br>
                                    <span style="font-size: 1.5em; color: #dc3545;">${toolReport.summary.failedMatches || 0}</span>
                                </div>
                            </div>
                        ` : '<p>No summary data available</p>'}
                        
                        ${toolReport.results && toolReport.results.length > 0 ? `
                            <h4>Recent Results</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Section</th>
                                        <th>Page</th>
                                        <th>Expected</th>
                                        <th>Actual</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${toolReport.results.slice(0, 5).map(result => `
                                        <tr class="${result.match ? 'match-yes' : 'match-no'}">
                                            <td><strong>${result.section}</strong></td>
                                            <td>${result.pageName}</td>
                                            <td>${result.expectedCount}</td>
                                            <td>${result.actualCount}</td>
                                            <td>
                                                <span class="badge ${result.match ? 'badge-success' : 'badge-danger'}">
                                                    ${result.match ? '✅ Match' : '❌ Mismatch'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ${toolReport.results.length > 5 ? `<p><em>... and ${toolReport.results.length - 5} more results</em></p>` : ''}
                        ` : '<p>No detailed results available</p>'}
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${report.recommendations.length > 0 ? `
            <div class="recommendations">
                <h2>🔍 Recommendations</h2>
                ${report.recommendations.map(rec => `
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 5px;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">
                            ${rec.type.replace(/_/g, ' ').toUpperCase()} (${rec.source})
                        </h4>
                        <p style="margin: 0 0 10px 0;">${rec.message}</p>
                        ${rec.pages && rec.pages.length > 0 ? `
                            <details>
                                <summary style="cursor: pointer; color: #495057;"><strong>Affected Pages (${rec.pages.length})</strong></summary>
                                <ul style="margin: 10px 0;">
                                    ${rec.pages.map(page => `<li>${page}</li>`).join('')}
                                </ul>
                            </details>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="recommendations">
                <h2>✅ All Checks Passed!</h2>
                <p>No issues were found during the content verification process.</p>
            </div>
        `}
    </div>
</body>
</html>`;
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new ContentVerificationRunner();
  runner.runAll().catch(console.error);
}

module.exports = ContentVerificationRunner;