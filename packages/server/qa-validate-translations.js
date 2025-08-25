const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL || 
  'postgresql://postgres.jwyfvpghtqtwyecqizrk:BankIM$2024Dev@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';

// Quality patterns to detect
const QUALITY_PATTERNS = {
  placeholder: /\[.*?\]|item_\d+|Field \d+|Text for|Label for/i,
  generic: /^(Item|Field|Text|Label|Value|Option|Button|Link|Title|Description)\s*\d*$/i,
  meaningful: /loan|credit|income|employment|mortgage|payment|interest|account|application|registration/i,
  businessTerms: /refinance|monthly|salary|employer|property|asset|liability|document|verification/i
};

async function performQAValidation() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const qaReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalItems: 0,
      totalTranslations: 0,
      itemsWithAllLanguages: 0,
      itemsMissingLanguages: 0,
      placeholderTranslations: 0,
      meaningfulTranslations: 0,
      genericTranslations: 0,
      qualityScore: 0
    },
    byScreen: {},
    byLanguage: {
      ru: { total: 0, placeholder: 0, meaningful: 0, generic: 0 },
      he: { total: 0, placeholder: 0, meaningful: 0, generic: 0 },
      en: { total: 0, placeholder: 0, meaningful: 0, generic: 0 }
    },
    issues: [],
    recommendations: []
  };

  try {
    await client.connect();
    console.log('🔍 Starting QA Validation of Translation Fixes...\n');

    // Get all content items with their translations
    const query = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ci.category,
        ct.language_code,
        ct.content_value,
        ct.status,
        ct.created_at,
        ct.updated_at
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = true
      ORDER BY ci.screen_location, ci.id, ct.language_code
    `;

    const result = await client.query(query);
    
    // Group by content item
    const itemsMap = new Map();
    
    result.rows.forEach(row => {
      if (!itemsMap.has(row.id)) {
        itemsMap.set(row.id, {
          id: row.id,
          content_key: row.content_key,
          screen_location: row.screen_location,
          component_type: row.component_type,
          category: row.category,
          translations: {}
        });
      }
      
      if (row.language_code && row.content_value) {
        itemsMap.get(row.id).translations[row.language_code] = {
          value: row.content_value,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      }
    });

    qaReport.summary.totalItems = itemsMap.size;

    // Analyze each item
    for (const [id, item] of itemsMap) {
      const languages = Object.keys(item.translations);
      const hasAllLanguages = languages.includes('ru') && languages.includes('he') && languages.includes('en');
      
      if (hasAllLanguages) {
        qaReport.summary.itemsWithAllLanguages++;
      } else {
        qaReport.summary.itemsMissingLanguages++;
        qaReport.issues.push({
          type: 'MISSING_LANGUAGE',
          item_id: id,
          content_key: item.content_key,
          missing: ['ru', 'he', 'en'].filter(lang => !languages.includes(lang))
        });
      }

      // Initialize screen stats
      if (!qaReport.byScreen[item.screen_location]) {
        qaReport.byScreen[item.screen_location] = {
          totalItems: 0,
          withTranslations: 0,
          missingTranslations: 0,
          placeholders: 0,
          meaningful: 0,
          qualityScore: 0
        };
      }
      
      qaReport.byScreen[item.screen_location].totalItems++;
      
      if (languages.length > 0) {
        qaReport.byScreen[item.screen_location].withTranslations++;
      } else {
        qaReport.byScreen[item.screen_location].missingTranslations++;
      }

      // Analyze translation quality
      for (const [lang, trans] of Object.entries(item.translations)) {
        qaReport.summary.totalTranslations++;
        qaReport.byLanguage[lang].total++;
        
        const value = trans.value;
        
        // Check for placeholders
        if (QUALITY_PATTERNS.placeholder.test(value)) {
          qaReport.summary.placeholderTranslations++;
          qaReport.byLanguage[lang].placeholder++;
          qaReport.byScreen[item.screen_location].placeholders++;
          
          if (qaReport.issues.length < 50) { // Limit to first 50 examples
            qaReport.issues.push({
              type: 'PLACEHOLDER_TEXT',
              item_id: id,
              content_key: item.content_key,
              language: lang,
              value: value.substring(0, 100)
            });
          }
        }
        // Check for meaningful business terms
        else if (QUALITY_PATTERNS.meaningful.test(value) || QUALITY_PATTERNS.businessTerms.test(value)) {
          qaReport.summary.meaningfulTranslations++;
          qaReport.byLanguage[lang].meaningful++;
          qaReport.byScreen[item.screen_location].meaningful++;
        }
        // Check for generic text
        else if (QUALITY_PATTERNS.generic.test(value)) {
          qaReport.summary.genericTranslations++;
          qaReport.byLanguage[lang].generic++;
        }
        
        // Check status
        if (trans.status !== 'approved') {
          qaReport.issues.push({
            type: 'UNAPPROVED_STATUS',
            item_id: id,
            content_key: item.content_key,
            language: lang,
            status: trans.status
          });
        }
      }
    }

    // Calculate quality scores
    if (qaReport.summary.totalTranslations > 0) {
      qaReport.summary.qualityScore = Math.round(
        (qaReport.summary.meaningfulTranslations / qaReport.summary.totalTranslations) * 100
      );
    }

    for (const screen in qaReport.byScreen) {
      const screenData = qaReport.byScreen[screen];
      if (screenData.withTranslations > 0) {
        screenData.qualityScore = Math.round(
          (screenData.meaningful / (screenData.withTranslations * 3)) * 100
        );
      }
    }

    // Generate recommendations
    if (qaReport.summary.placeholderTranslations > 100) {
      qaReport.recommendations.push({
        priority: 'CRITICAL',
        issue: `${qaReport.summary.placeholderTranslations} placeholder translations detected`,
        action: 'Replace all placeholder text with actual business content before production'
      });
    }

    if (qaReport.summary.itemsMissingLanguages > 0) {
      qaReport.recommendations.push({
        priority: 'HIGH',
        issue: `${qaReport.summary.itemsMissingLanguages} items missing translations`,
        action: 'Complete translations for all languages'
      });
    }

    if (qaReport.summary.qualityScore < 50) {
      qaReport.recommendations.push({
        priority: 'HIGH',
        issue: `Low quality score: ${qaReport.summary.qualityScore}%`,
        action: 'Review and improve translation quality with business-appropriate content'
      });
    }

    // Find screens with worst quality
    const worstScreens = Object.entries(qaReport.byScreen)
      .filter(([_, data]) => data.qualityScore < 30 && data.totalItems > 5)
      .sort((a, b) => a[1].qualityScore - b[1].qualityScore)
      .slice(0, 5);

    if (worstScreens.length > 0) {
      qaReport.recommendations.push({
        priority: 'MEDIUM',
        issue: 'Screens with poor translation quality',
        screens: worstScreens.map(([screen, data]) => ({
          screen,
          qualityScore: data.qualityScore,
          placeholders: data.placeholders
        })),
        action: 'Prioritize improving these screens first'
      });
    }

    // Print console report
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           QA VALIDATION REPORT - TRANSLATIONS             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 SUMMARY STATISTICS');
    console.log('─────────────────────');
    console.log(`Total Content Items: ${qaReport.summary.totalItems}`);
    console.log(`Total Translations: ${qaReport.summary.totalTranslations}`);
    console.log(`Items with All Languages: ${qaReport.summary.itemsWithAllLanguages}`);
    console.log(`Items Missing Languages: ${qaReport.summary.itemsMissingLanguages}`);
    console.log('');
    console.log('📈 QUALITY METRICS');
    console.log('─────────────────');
    console.log(`Meaningful Translations: ${qaReport.summary.meaningfulTranslations} (${qaReport.summary.qualityScore}%)`);
    console.log(`Placeholder Translations: ${qaReport.summary.placeholderTranslations}`);
    console.log(`Generic Translations: ${qaReport.summary.genericTranslations}`);
    console.log(`Overall Quality Score: ${qaReport.summary.qualityScore}%`);
    console.log('');

    console.log('🌐 BY LANGUAGE BREAKDOWN');
    console.log('───────────────────────');
    for (const [lang, data] of Object.entries(qaReport.byLanguage)) {
      const langName = { ru: 'Russian', he: 'Hebrew', en: 'English' }[lang];
      const qualityPct = data.total > 0 ? Math.round((data.meaningful / data.total) * 100) : 0;
      console.log(`${langName}: ${data.total} total, ${data.meaningful} meaningful (${qualityPct}%), ${data.placeholder} placeholders`);
    }
    console.log('');

    console.log('📍 TOP 5 SCREENS BY VOLUME');
    console.log('─────────────────────────');
    const topScreens = Object.entries(qaReport.byScreen)
      .sort((a, b) => b[1].totalItems - a[1].totalItems)
      .slice(0, 5);
    
    topScreens.forEach(([screen, data]) => {
      console.log(`${screen}: ${data.totalItems} items, Quality: ${data.qualityScore}%`);
    });
    console.log('');

    if (qaReport.recommendations.length > 0) {
      console.log('⚠️  RECOMMENDATIONS');
      console.log('──────────────────');
      qaReport.recommendations.forEach(rec => {
        console.log(`[${rec.priority}] ${rec.issue}`);
        console.log(`   → ${rec.action}`);
        if (rec.screens) {
          rec.screens.forEach(s => {
            console.log(`      - ${s.screen}: ${s.qualityScore}% quality, ${s.placeholders} placeholders`);
          });
        }
      });
      console.log('');
    }

    // Quality verdict
    console.log('🎯 QUALITY VERDICT');
    console.log('─────────────────');
    if (qaReport.summary.qualityScore >= 80) {
      console.log('✅ EXCELLENT: Translations are high quality and production-ready');
    } else if (qaReport.summary.qualityScore >= 60) {
      console.log('⚠️  GOOD: Translations are acceptable but could be improved');
    } else if (qaReport.summary.qualityScore >= 40) {
      console.log('⚠️  FAIR: Significant improvements needed before production');
    } else {
      console.log('❌ POOR: Major rework required - too many placeholders/generic text');
    }
    console.log('');

    // Save detailed report
    const reportDir = path.join(__dirname, 'qa_reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportDir, `qa_validation_${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(qaReport, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    // Create actionable CSV for fixing
    if (qaReport.issues.filter(i => i.type === 'PLACEHOLDER_TEXT').length > 0) {
      const csvPath = path.join(reportDir, `placeholders_to_fix_${timestamp}.csv`);
      const csvHeader = 'item_id,content_key,language,current_value,suggested_value\n';
      let csvContent = csvHeader;
      
      qaReport.issues
        .filter(i => i.type === 'PLACEHOLDER_TEXT')
        .slice(0, 100) // First 100 for review
        .forEach(issue => {
          csvContent += `${issue.item_id},"${issue.content_key}","${issue.language}","${issue.value}",""\n`;
        });
      
      fs.writeFileSync(csvPath, csvContent);
      console.log(`📋 Placeholders to fix: ${csvPath}`);
    }

    return qaReport;

  } catch (error) {
    console.error('❌ QA Validation Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run QA validation
performQAValidation()
  .then(report => {
    console.log('\n✅ QA Validation Complete!');
    console.log(`Final Quality Score: ${report.summary.qualityScore}%`);
    process.exit(report.summary.qualityScore >= 40 ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });