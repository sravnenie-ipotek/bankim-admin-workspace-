import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4003', // Updated to match current client port
    setupNodeEvents(on, config) {
      // implement node event listeners here
      let logs: any[] = [];
      
      on('task', {
        log(entry) {
          logs.push(entry);
          return null;
        },
        getLogs() {
          return logs;
        },
        clearLogs() {
          logs = [];
          return null;
        },
        generateVerificationReport(results) {
          const report = {
            timestamp: new Date().toISOString(),
            summary: {
              totalResults: results.length,
              successfulMatches: results.filter((r: any) => r.match).length,
              failedMatches: results.filter((r: any) => !r.match).length,
              sectionsChecked: [...new Set(results.map((r: any) => r.section))].length
            },
            results: results,
            recommendations: generateRecommendations(results)
          };

          // Save JSON report
          const reportPath = path.join(process.cwd(), 'cypress', 'reports', 'content-verification-report.json');
          fs.mkdirSync(path.dirname(reportPath), { recursive: true });
          fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

          // Generate HTML report
          const htmlReport = generateHtmlReport(report);
          const htmlPath = path.join(process.cwd(), 'cypress', 'reports', 'content-verification-report.html');
          fs.writeFileSync(htmlPath, htmlReport);

          console.log('📊 Cypress Verification Report Generated:');
          console.log(`📄 JSON: ${reportPath}`);
          console.log(`🌐 HTML: ${htmlPath}`);

          return report;
        }
      });

      function generateRecommendations(results: any[]) {
        const recommendations = [];
        
        const failedMatches = results.filter(r => !r.match);
        if (failedMatches.length > 0) {
          recommendations.push({
            type: 'count_mismatch',
            message: `${failedMatches.length} pages have count mismatches`,
            pages: failedMatches.map(r => `${r.section}/${r.pageName}`)
          });
        }
        
        return recommendations;
      }

      function generateHtmlReport(report: any) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>🚀 Cypress Content Verification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff; }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #343a40; color: white; font-weight: bold; }
        .match-yes { background-color: #d4edda; }
        .match-no { background-color: #f8d7da; }
        tr:hover { background-color: #f5f5f5; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Cypress Content Verification Report</h1>
        <p>Automated verification of content sections and action counts</p>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${report.summary.totalResults}</div>
            <div>Total Results</div>
        </div>
        <div class="stat-card">
            <div class="stat-number success">${report.summary.successfulMatches}</div>
            <div>Successful Matches</div>
        </div>
        <div class="stat-card">
            <div class="stat-number error">${report.summary.failedMatches}</div>
            <div>Failed Matches</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${report.summary.sectionsChecked}</div>
            <div>Sections Checked</div>
        </div>
    </div>
    
    <div class="summary">
        <h2>📋 Summary</h2>
        <p><strong>Success Rate:</strong> ${Math.round((report.summary.successfulMatches / report.summary.totalResults) * 100)}%</p>
        <p>This report shows the verification results for content sections, comparing expected action counts from overview pages with actual counts found in drill pages.</p>
    </div>
    
    <h2>📊 Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Section</th>
                <th>Page Name</th>
                <th>Expected Count</th>
                <th>Actual Count</th>
                <th>Match</th>
                <th>Drill URL</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map((result: any) => `
                <tr class="${result.match ? 'match-yes' : 'match-no'}">
                    <td><strong>${result.section}</strong></td>
                    <td>${result.pageName}</td>
                    <td>${result.expectedCount}</td>
                    <td>${result.actualCount}</td>
                    <td>${result.match ? '✅ Match' : '❌ Mismatch'}</td>
                    <td><small>${result.drillUrl || 'N/A'}</small></td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    ${report.recommendations.length > 0 ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h2>⚠️ Recommendations</h2>
            ${report.recommendations.map((rec: any) => `
                <h3>${rec.type.replace('_', ' ').toUpperCase()}</h3>
                <p>${rec.message}</p>
                <ul>
                    ${rec.pages.map((page: string) => `<li>${page}</li>`).join('')}
                </ul>
            `).join('')}
        </div>
    ` : '<div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;"><h2>✅ All checks passed!</h2><p>No issues found in content verification.</p></div>'}
</body>
</html>`;
      }
      
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0
    },
  },
});