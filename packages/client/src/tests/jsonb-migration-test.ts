/**
 * JSONB Migration Test Suite
 * 
 * Comprehensive testing for admin panel JSONB migration
 * WITHOUT modifying any database data.
 * 
 * Run this to validate the migration before going live.
 */

import apiV2Service, { DataTransformer } from '../services/apiV2';

// ============================================
// TEST DATA SAMPLES
// ============================================

const TEST_SAMPLES = {
  // Sample 1: Mortgage dropdown
  mortgage: {
    key: 'property_ownership',
    screenLocation: 'mortgage_step1',
    oldFormat: {
      titleRu: 'Владение недвижимостью',
      titleHe: 'בעלות על נכס',
      options: [
        { ru: 'У меня нет недвижимости', he: 'אין לי נכס' },
        { ru: 'У меня есть недвижимость', he: 'יש לי נכס' },
        { ru: 'Я продаю недвижимость', he: 'אני מוכר נכס' }
      ]
    },
    expectedJSONB: {
      field_name: 'property_ownership',
      field_type: 'dropdown',
      label: {
        en: 'Владение недвижимостью',
        he: 'בעלות על נכס',
        ru: 'Владение недвижимостью'
      },
      options: [
        {
          value: 'option_1',
          label: {
            en: 'У меня нет недвижимости',
            he: 'אין לי נכס',
            ru: 'У меня нет недвижимости'
          }
        }
      ]
    }
  },

  // Sample 2: Credit dropdown
  credit: {
    key: 'income_source',
    screenLocation: 'credit_step2',
    oldFormat: {
      label: {
        ru: 'Источник дохода',
        he: 'מקור הכנסה',
        en: 'Income Source'
      },
      options: [
        { id: 1, ru: 'Зарплата', he: 'משכורת', en: 'Salary' },
        { id: 2, ru: 'Бизнес', he: 'עסק', en: 'Business' }
      ]
    }
  },

  // Sample 3: Menu item
  menu: {
    key: 'calculate_mortgage',
    screenLocation: 'menu_mortgage',
    oldFormat: {
      titleRu: 'Рассчитать ипотеку',
      titleHe: 'חישוב משכנתא'
    }
  }
};

// ============================================
// TEST RUNNER CLASS
// ============================================

class JSONBMigrationTester {
  private testsPassed: number = 0;
  private testsFailed: number = 0;

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         JSONB MIGRATION TEST SUITE                       ║');
    console.log('║         No Database Modifications Will Occur             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    // Configure test mode
    apiV2Service.setTestMode({
      enabled: true,
      dryRun: true,      // No actual API calls
      logOnly: true,     // Only log operations
      validateOnly: true, // Only validate structure
      useRealEndpoint: false
    });

    // Run test categories
    await this.testDataTransformation();
    await this.testValidation();
    await this.testAPIEndpoint();
    await this.testErrorHandling();
    await this.testBackwardCompatibility();

    // Show results
    this.showTestResults();
  }

  /**
   * Test 1: Data Transformation
   */
  private async testDataTransformation(): Promise<void> {
    console.log('🧪 TEST 1: Data Transformation');
    console.log('─────────────────────────────');

    try {
      // Test mortgage dropdown transformation
      const mortgageResult = DataTransformer.transformToJSONB(
        TEST_SAMPLES.mortgage.key,
        TEST_SAMPLES.mortgage.oldFormat,
        'dropdown'
      );

      this.assertStructure(
        'Mortgage dropdown transformation',
        mortgageResult,
        {
          field_name: TEST_SAMPLES.mortgage.key,
          field_type: 'dropdown',
          hasLabel: true,
          hasOptions: true,
          optionCount: 3
        }
      );

      // Test credit dropdown transformation
      const creditResult = DataTransformer.transformToJSONB(
        TEST_SAMPLES.credit.key,
        TEST_SAMPLES.credit.oldFormat,
        'dropdown'
      );

      this.assertStructure(
        'Credit dropdown transformation',
        creditResult,
        {
          field_name: TEST_SAMPLES.credit.key,
          field_type: 'dropdown',
          hasLabel: true,
          hasOptions: true,
          optionCount: 2
        }
      );

      // Test menu transformation
      const menuResult = DataTransformer.transformToJSONB(
        TEST_SAMPLES.menu.key,
        TEST_SAMPLES.menu.oldFormat,
        'menu'
      );

      this.assertStructure(
        'Menu item transformation',
        menuResult,
        {
          field_name: TEST_SAMPLES.menu.key,
          field_type: 'menu',
          hasLabel: true,
          hasOptions: false
        }
      );

      console.log('✅ Data transformation tests passed\n');
      this.testsPassed += 3;

    } catch (error) {
      console.error('❌ Data transformation tests failed:', error);
      this.testsFailed += 3;
    }
  }

  /**
   * Test 2: Validation
   */
  private async testValidation(): Promise<void> {
    console.log('🧪 TEST 2: JSONB Structure Validation');
    console.log('─────────────────────────────────────');

    try {
      // Valid structure
      const validData = {
        field_name: 'test_field',
        field_type: 'dropdown' as const,
        label: { en: 'Test', he: 'טסט', ru: 'Тест' },
        options: [
          {
            value: 'opt1',
            label: { en: 'Option 1', he: 'אפשרות 1', ru: 'Опция 1' }
          }
        ]
      };

      const validResult = DataTransformer.validateJSONB(validData);
      this.assert('Valid structure validation', validResult.valid, true);

      // Invalid structure - missing required fields
      const invalidData = {
        field_type: 'dropdown' as const,
        label: { en: 'Test' } // Missing ru and he
      } as any;

      const invalidResult = DataTransformer.validateJSONB(invalidData);
      this.assert('Invalid structure detection', invalidResult.valid, false);
      this.assert('Error detection', invalidResult.errors.length > 0, true);

      console.log('✅ Validation tests passed\n');
      this.testsPassed += 3;

    } catch (error) {
      console.error('❌ Validation tests failed:', error);
      this.testsFailed += 3;
    }
  }

  /**
   * Test 3: API Endpoint (Shadow Mode)
   */
  private async testAPIEndpoint(): Promise<void> {
    console.log('🧪 TEST 3: API Endpoint Shadow Test');
    console.log('────────────────────────────────────');

    try {
      // Test API call in dry run mode
      const response = await apiV2Service.updateContent(
        'test_dropdown',
        'test_screen',
        TEST_SAMPLES.mortgage.oldFormat,
        'dropdown'
      );

      this.assert('API response success', response.success, true);
      this.assert('Test mode flag', response.data?.test_mode, true);

      // Verify test results were stored
      const storedResults = apiV2Service.getTestResults('test_dropdown');
      this.assert('Test results stored', storedResults !== undefined, true);

      console.log('✅ API endpoint tests passed\n');
      this.testsPassed += 3;

    } catch (error) {
      console.error('❌ API endpoint tests failed:', error);
      this.testsFailed += 3;
    }
  }

  /**
   * Test 4: Error Handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🧪 TEST 4: Error Handling');
    console.log('─────────────────────────');

    try {
      // Test with invalid data
      const response = await apiV2Service.updateContent(
        '',  // Invalid key
        '',  // Invalid screen
        {},  // Invalid data
        'dropdown'
      );

      // Should handle error gracefully
      this.assert('Error handled gracefully', response.success, false);
      this.assert('Error message provided', response.error !== undefined, true);

      console.log('✅ Error handling tests passed\n');
      this.testsPassed += 2;

    } catch (error) {
      console.error('❌ Error handling tests failed:', error);
      this.testsFailed += 2;
    }
  }

  /**
   * Test 5: Backward Compatibility
   */
  private async testBackwardCompatibility(): Promise<void> {
    console.log('🧪 TEST 5: Backward Compatibility');
    console.log('──────────────────────────────────');

    try {
      // Test with old 'text' field (should convert to 'label')
      const oldTextFormat = {
        options: [
          { value: '1', text: 'Option with text field' }
        ]
      };

      const converted = DataTransformer.transformToJSONB(
        'legacy_dropdown',
        oldTextFormat,
        'dropdown'
      );

      this.assert(
        'Text field converted to label',
        converted.options?.[0].label.en,
        'Option with text field'
      );

      console.log('✅ Backward compatibility tests passed\n');
      this.testsPassed += 1;

    } catch (error) {
      console.error('❌ Backward compatibility tests failed:', error);
      this.testsFailed += 1;
    }
  }

  /**
   * Helper: Assert with logging
   */
  private assert(testName: string, actual: any, expected: any): void {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    
    if (passed) {
      console.log(`  ✅ ${testName}`);
    } else {
      console.log(`  ❌ ${testName}`);
      console.log(`     Expected: ${JSON.stringify(expected)}`);
      console.log(`     Actual:   ${JSON.stringify(actual)}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  /**
   * Helper: Assert structure
   */
  private assertStructure(
    testName: string,
    data: any,
    expectations: any
  ): void {
    console.log(`  Testing: ${testName}`);
    
    if (expectations.field_name) {
      this.assert('field_name', data.field_name, expectations.field_name);
    }
    
    if (expectations.field_type) {
      this.assert('field_type', data.field_type, expectations.field_type);
    }
    
    if (expectations.hasLabel) {
      this.assert('has label', !!data.label, true);
      this.assert('label.ru exists', !!data.label?.ru, true);
      this.assert('label.he exists', !!data.label?.he, true);
    }
    
    if (expectations.hasOptions) {
      this.assert('has options', Array.isArray(data.options), true);
    }
    
    if (expectations.optionCount) {
      this.assert('option count', data.options?.length, expectations.optionCount);
    }
  }

  /**
   * Show test results summary
   */
  private showTestResults(): void {
    const total = this.testsPassed + this.testsFailed;
    const successRate = total > 0 ? (this.testsPassed / total * 100).toFixed(1) : '0';

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Total Tests:    ${total}`);
    console.log(`  Passed:         ${this.testsPassed} ✅`);
    console.log(`  Failed:         ${this.testsFailed} ❌`);
    console.log(`  Success Rate:   ${successRate}%`);
    console.log('');

    if (this.testsFailed === 0) {
      console.log('🎉 All tests passed! Ready for production migration.');
    } else {
      console.log('⚠️  Some tests failed. Please review before proceeding.');
    }

    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('  1. Review test results above');
    console.log('  2. If all tests pass, enable real endpoint testing');
    console.log('  3. Run shadow tests with actual UI interactions');
    console.log('  4. After validation, switch to production mode');
    console.log('');

    // Clear test results after display
    apiV2Service.clearTestResults();
  }
}

// ============================================
// EXPORT TEST RUNNER
// ============================================

const migrationTester = new JSONBMigrationTester();

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - add to window for console access
  (window as any).runMigrationTests = () => migrationTester.runAllTests();
  console.log('💡 Run tests with: runMigrationTests()');
}

export { migrationTester };
export default migrationTester;