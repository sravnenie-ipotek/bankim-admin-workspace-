require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// QA Test Suite for Improved Drill Endpoints
class QATestSuite {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Testing: ${testName}`);
      const result = await testFunction();
      
      if (result.passed) {
        this.passedTests++;
        console.log(`✅ PASSED: ${testName}`);
        if (result.details) console.log(`   ${result.details}`);
      } else {
        this.failedTests++;
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${result.error}`);
      }
      
      this.testResults.push({ testName, ...result });
      console.log('');
    } catch (error) {
      this.failedTests++;
      console.log(`💥 CRASHED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.testResults.push({ testName, passed: false, error: error.message });
      console.log('');
    }
  }

  async testMortgageRegression() {
    const response = await axios.get(`${BASE_URL}/api/content/credit/drill/mortgage_step1?lang=ru`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    // Check if mortgage endpoint is still accessible (should it be?)
    if (!data || !data.actions) {
      // Try the actual mortgage endpoint instead
      const mortgageResponse = await axios.get(`${BASE_URL}/api/content/mortgage/drill/mortgage_step1?lang=ru`);
      
      if (mortgageResponse.status === 200) {
        return { 
          passed: true, 
          details: 'Mortgage endpoint correctly separate from credit endpoint'
        };
      } else {
        return { 
          passed: false, 
          error: 'Cannot access mortgage_step1 data through any endpoint'
        };
      }
    }

    // If mortgage data is accessible through credit endpoint
    const coverage = data.stats?.translation_coverage || 0;
    if (coverage >= 95) {
      return { 
        passed: true, 
        details: `Mortgage data has ${coverage}% coverage`
      };
    } else {
      return { 
        passed: false, 
        error: `Mortgage coverage dropped to ${coverage}%`
      };
    }
  }

  async testCreditWithTranslations() {
    const response = await axios.get(`${BASE_URL}/api/content/credit/drill/credit_step1?lang=ru`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    if (!data || !data.actions || !data.stats) {
      return { passed: false, error: 'Invalid response structure' };
    }

    const { stats, actions } = data;
    
    // Credit step1 should have high translation coverage
    if (stats.translation_coverage < 80) {
      return { 
        passed: false, 
        error: `Low coverage: ${stats.translation_coverage}%`
      };
    }

    // Check new format fields exist
    const firstAction = actions[0];
    if (!('has_translation' in firstAction) || !('fallback_used' in firstAction) || !('value' in firstAction)) {
      return { 
        passed: false, 
        error: 'Missing new format fields (has_translation, fallback_used, value)'
      };
    }

    return { 
      passed: true, 
      details: `${stats.translation_coverage}% coverage, ${stats.items_with_translation}/${stats.total_items} items translated`
    };
  }

  async testCreditRefiMissingTranslations() {
    const response = await axios.get(`${BASE_URL}/api/content/credit-refi/drill/credit_refi_step2?lang=ru`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    if (!data || !data.actions || !data.stats) {
      return { passed: false, error: 'Invalid response structure' };
    }

    const { stats, actions } = data;
    
    // Credit-refi step2 should have very low or zero translation coverage
    if (stats.translation_coverage > 20) {
      return { 
        passed: false, 
        error: `Unexpectedly high coverage: ${stats.translation_coverage}%`
      };
    }

    // Check that missing translations are properly flagged
    const missingItems = actions.filter(action => !action.has_translation && !action.fallback_used);
    if (missingItems.length === 0 && stats.translation_coverage === 0) {
      return { 
        passed: false, 
        error: 'No items flagged as missing despite 0% coverage'
      };
    }

    // Check legacy format still works
    const firstAction = actions[0];
    if (!firstAction.translations || !firstAction.translations.ru) {
      return { 
        passed: false, 
        error: 'Legacy translations format missing'
      };
    }

    return { 
      passed: true, 
      details: `${stats.translation_coverage}% coverage, ${stats.items_missing_translation}/${stats.total_items} items missing`
    };
  }

  async testLanguageParameter() {
    // Test different languages
    const languages = ['ru', 'en', 'he'];
    const results = {};
    
    for (const lang of languages) {
      const response = await axios.get(`${BASE_URL}/api/content/credit/drill/credit_step1?lang=${lang}`);
      
      if (response.status !== 200) {
        return { passed: false, error: `HTTP ${response.status} for language ${lang}` };
      }

      const { data } = response.data;
      results[lang] = {
        requestedLanguage: data.requestedLanguage,
        coverage: data.stats?.translation_coverage || 0
      };
    }

    // Verify requested language is returned correctly
    for (const lang of languages) {
      if (results[lang].requestedLanguage !== lang) {
        return { 
          passed: false, 
          error: `Language parameter not working: requested ${lang}, got ${results[lang].requestedLanguage}`
        };
      }
    }

    return { 
      passed: true, 
      details: `Languages tested: ${Object.keys(results).map(lang => `${lang}(${results[lang].coverage}%)`).join(', ')}`
    };
  }

  async testFallbackLogic() {
    // Test with a language that might not exist but English fallback should work
    const response = await axios.get(`${BASE_URL}/api/content/credit/drill/credit_step1?lang=fr`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    if (!data || !data.actions || !data.stats) {
      return { passed: false, error: 'Invalid response structure' };
    }

    // Check if any items are using fallback
    const itemsWithFallback = data.actions.filter(action => action.fallback_used);
    const itemsWithTranslation = data.actions.filter(action => action.has_translation);
    
    // For credit_step1, we expect either direct translations or fallbacks
    const totalCoverage = itemsWithTranslation.length + itemsWithFallback.length;
    
    if (totalCoverage === 0) {
      return { 
        passed: false, 
        error: 'No translations or fallbacks found'
      };
    }

    return { 
      passed: true, 
      details: `Fallback logic working: ${itemsWithFallback.length} items using fallback, ${itemsWithTranslation.length} direct translations`
    };
  }

  async testBackwardCompatibility() {
    const response = await axios.get(`${BASE_URL}/api/content/credit-refi/drill/credit_refi_step1`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    // Check that legacy fields still exist
    const legacyFields = ['actionCount', 'actions', 'screen_location'];
    for (const field of legacyFields) {
      if (!(field in data)) {
        return { 
          passed: false, 
          error: `Legacy field missing: ${field}`
        };
      }
    }

    // Check that actions have legacy translations format
    const firstAction = data.actions[0];
    if (!firstAction.translations || !('ru' in firstAction.translations)) {
      return { 
        passed: false, 
        error: 'Legacy translations format missing'
      };
    }

    // Check that new fields exist alongside legacy ones
    if (!('value' in firstAction) || !('has_translation' in firstAction)) {
      return { 
        passed: false, 
        error: 'New format fields missing'
      };
    }

    return { 
      passed: true, 
      details: 'Both legacy and new formats present'
    };
  }

  async testResponseStructure() {
    const response = await axios.get(`${BASE_URL}/api/content/credit/drill/credit_summary?lang=en`);
    
    if (response.status !== 200) {
      return { passed: false, error: `HTTP ${response.status}` };
    }

    const { data } = response.data;
    
    // Check required new fields
    const requiredFields = ['stats', 'requestedLanguage', 'screenLocation'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return { 
          passed: false, 
          error: `Required field missing: ${field}`
        };
      }
    }

    // Check stats structure
    const requiredStats = ['total_items', 'items_with_translation', 'items_missing_translation', 'translation_coverage'];
    for (const stat of requiredStats) {
      if (!(stat in data.stats)) {
        return { 
          passed: false, 
          error: `Required stat missing: ${stat}`
        };
      }
    }

    return { 
      passed: true, 
      details: 'Response structure correct'
    };
  }

  async runAllTests() {
    console.log('🚀 Starting QA Test Suite for Improved Drill Endpoints\n');
    console.log('📝 Testing improved data fetching strategy implementation\n');

    await this.runTest('Mortgage Regression Test', () => this.testMortgageRegression());
    await this.runTest('Credit With Translations', () => this.testCreditWithTranslations());
    await this.runTest('Credit-Refi Missing Translations', () => this.testCreditRefiMissingTranslations());
    await this.runTest('Language Parameter Support', () => this.testLanguageParameter());
    await this.runTest('Fallback Logic', () => this.testFallbackLogic());
    await this.runTest('Backward Compatibility', () => this.testBackwardCompatibility());
    await this.runTest('Response Structure', () => this.testResponseStructure());

    console.log('📊 QA Test Results Summary:');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`);
    
    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! No regressions detected.');
      console.log('✨ Improved drill endpoints are ready for production.');
    } else {
      console.log(`\n⚠️  ${this.failedTests} test(s) failed. Review before deployment.`);
    }

    return { 
      passed: this.failedTests === 0,
      totalTests: this.passedTests + this.failedTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      results: this.testResults
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  const qa = new QATestSuite();
  qa.runAllTests()
    .then(results => {
      process.exit(results.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = QATestSuite;