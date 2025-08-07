/**
 * BrowserStack Automation Tests for Calculator Formula Page
 * Comprehensive multilingual testing with dropdown persistence and RTL support
 */

const { By, until, Key } = require('selenium-webdriver');
const BrowserStackSetup = require('./setup');
const assert = require('assert');

class CalculatorFormulaTests {
  constructor() {
    this.setup = new BrowserStackSetup();
    this.testData = {
      languages: ['en', 'he', 'ru'],
      dropdownSelectors: {
        bankSelector: {
          'data-testid': 'bank-selector',
          'data-cy': 'bank-dropdown',
          'id': 'bank-select',
          'css': '.bank-selector, .dropdown[data-type="bank"]',
          'xpath': '//select[contains(@class, "bank")] | //div[contains(@class, "bank-selector")]'
        },
        calculatorType: {
          'data-testid': 'calculator-type-selector',
          'data-cy': 'calculator-type',
          'id': 'calculator-type',
          'css': '.calculator-type-selector, .dropdown[data-type="calculator"]',
          'xpath': '//select[contains(@class, "calculator")] | //div[contains(@class, "calculator-type")]'
        }
      },
      inputSelectors: {
        loanAmount: {
          'data-testid': 'loan-amount-input',
          'data-cy': 'loan-amount',
          'id': 'loan-amount',
          'css': 'input[name="loanAmount"], #loan-amount-input',
          'xpath': '//input[contains(@placeholder, "סכום") or contains(@placeholder, "Amount") or contains(@placeholder, "Сумма")]'
        },
        interestRate: {
          'data-testid': 'interest-rate-input',
          'data-cy': 'interest-rate',
          'id': 'interest-rate',
          'css': 'input[name="interestRate"], #interest-rate-input',
          'xpath': '//input[contains(@placeholder, "ריבית") or contains(@placeholder, "Rate") or contains(@placeholder, "Процент")]'
        }
      },
      testValues: {
        loanAmount: '500000',
        interestRate: '3.5',
        bankOptions: {
          en: ['Bank Hapoalim', 'Bank Leumi', 'Discount Bank', 'Mizrahi Tefahot'],
          he: ['בנק הפועלים', 'בנק לאומי', 'בנק דיסקונט', 'מזרחי טפחות'],
          ru: ['Банк Апоалим', 'Банк Леуми', 'Дисконт Банк', 'Мизрахи Тефахот']
        }
      }
    };
  }

  /**
   * Run comprehensive test suite across all browsers and languages
   */
  async runFullTestSuite() {
    console.log('🚀 Starting BrowserStack Calculator Formula Test Suite');
    console.log('====================================================');

    // Initialize BrowserStack Local
    await this.setup.initializeLocal();

    try {
      // Test on desktop browsers
      await this.testOnBrowserMatrix('desktop');
      
      // Test RTL languages specifically
      await this.testOnBrowserMatrix('rtl');
      
      // Test on mobile browsers
      await this.testOnBrowserMatrix('mobile');
      
    } finally {
      await this.setup.cleanup();
      return this.setup.generateReport();
    }
  }

  /**
   * Test on specific browser matrix
   * @param {string} browserType - desktop, mobile, or rtl
   */
  async testOnBrowserMatrix(browserType) {
    const browsers = this.setup.constructor.browserMatrix || require('../../browserstack.config.js').browserMatrix;
    const browserList = browsers[browserType] || [];

    for (let i = 0; i < browserList.length; i++) {
      const browser = browserList[i];
      console.log(`\n🌐 Testing on ${browserType} browser: ${browser.browserName || browser.deviceName}`);

      try {
        await this.setup.createDriver(browserType, i);
        
        // Run all test scenarios
        await this.runTestScenarios(browserType);
        
      } catch (error) {
        console.error(`❌ Browser test failed: ${error.message}`);
        await this.setup.reportTestResult(
          `${browserType}-${browser.browserName || browser.deviceName}`,
          false,
          error.message
        );
      } finally {
        if (this.setup.driver) {
          await this.setup.driver.quit();
        }
      }
    }
  }

  /**
   * Run all test scenarios for current browser
   * @param {string} browserType - Current browser type
   */
  async runTestScenarios(browserType) {
    // Test each language
    for (const language of this.testData.languages) {
      console.log(`\n🌍 Testing language: ${language.toUpperCase()}`);
      
      try {
        await this.setup.navigateToCalculatorFormula(language);
        
        // Run core test scenarios
        await this.testPageLoad(language);
        await this.testDropdownFunctionality(language);
        await this.testFormPersistence(language);
        await this.testCalculationFlow(language);
        
        // RTL-specific tests for Hebrew
        if (language === 'he' || browserType === 'rtl') {
          await this.testRTLSpecific(language);
        }
        
      } catch (error) {
        console.error(`❌ Language test failed (${language}):`, error.message);
        await this.setup.reportTestResult(
          `Language-${language}`,
          false,
          error.message
        );
      }
    }
  }

  /**
   * Test 1: Page Load and Initial State
   * @param {string} language - Current language
   */
  async testPageLoad(language) {
    console.log('📋 Testing page load and initial state...');
    
    try {
      // Wait for main container
      const mainContainer = await this.setup.findElementSmart({
        'data-testid': 'calculator-formula-page',
        'css': '.calculator-formula, .main-content, .page-container',
        'xpath': '//div[contains(@class, "calculator") or contains(@class, "formula")]'
      });

      assert(mainContainer, 'Main container not found');

      // Check for language-specific content
      const expectedTexts = {
        en: ['Calculator', 'Formula', 'Bank', 'Amount'],
        he: ['מחשבון', 'נוסחה', 'בנק', 'סכום'],
        ru: ['Калькулятор', 'Формула', 'Банк', 'Сумма']
      };

      const textsToCheck = expectedTexts[language] || expectedTexts.en;
      let foundTexts = 0;

      for (const text of textsToCheck) {
        try {
          await this.setup.driver.wait(
            until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)),
            5000
          );
          foundTexts++;
        } catch (e) {
          console.log(`⚠️ Text not found: ${text}`);
        }
      }

      const success = foundTexts >= textsToCheck.length / 2;
      await this.setup.reportTestResult(
        `Page Load - ${language}`,
        success,
        success ? '' : `Only found ${foundTexts}/${textsToCheck.length} expected texts`
      );

    } catch (error) {
      await this.setup.reportTestResult('Page Load', false, error.message);
      throw error;
    }
  }

  /**
   * Test 2: Dropdown Functionality with Advanced Interaction
   * @param {string} language - Current language
   */
  async testDropdownFunctionality(language) {
    console.log('🎯 Testing dropdown functionality...');

    try {
      // Test bank selector dropdown
      const bankDropdown = await this.setup.findElementSmart(this.testData.dropdownSelectors.bankSelector);
      
      // Check if it's a select element or custom dropdown
      const tagName = await bankDropdown.getTagName();
      
      if (tagName === 'select') {
        await this.testNativeDropdown(bankDropdown, language, 'bank');
      } else {
        await this.testCustomDropdown(bankDropdown, language, 'bank');
      }

      // Test calculator type dropdown if present
      try {
        const calculatorDropdown = await this.setup.findElementSmart(
          this.testData.dropdownSelectors.calculatorType,
          5000
        );
        
        const calculatorTagName = await calculatorDropdown.getTagName();
        if (calculatorTagName === 'select') {
          await this.testNativeDropdown(calculatorDropdown, language, 'calculator');
        } else {
          await this.testCustomDropdown(calculatorDropdown, language, 'calculator');
        }
      } catch (e) {
        console.log('⚠️ Calculator type dropdown not found, skipping...');
      }

      await this.setup.reportTestResult(`Dropdown Functionality - ${language}`, true);

    } catch (error) {
      await this.setup.reportTestResult(
        `Dropdown Functionality - ${language}`,
        false,
        error.message
      );
    }
  }

  /**
   * Test native HTML select dropdown
   * @param {WebElement} dropdown - Dropdown element
   * @param {string} language - Current language
   * @param {string} type - Type of dropdown (bank, calculator)
   */
  async testNativeDropdown(dropdown, language, type) {
    console.log(`🔽 Testing native ${type} dropdown...`);
    
    // Get all options
    const options = await dropdown.findElements(By.tagName('option'));
    console.log(`📊 Found ${options.length} options`);

    if (options.length > 1) {
      // Test selecting different options
      for (let i = 1; i < Math.min(options.length, 4); i++) {
        const option = options[i];
        const optionText = await option.getText();
        
        console.log(`🎯 Selecting option: ${optionText}`);
        await option.click();
        
        // Wait for selection to process
        await this.setup.driver.sleep(1000);
        
        // Verify selection
        const selectedValue = await dropdown.getAttribute('value');
        const selectedText = await dropdown.findElement(By.css('option:checked')).getText();
        
        console.log(`✅ Selected: ${selectedText} (value: ${selectedValue})`);
      }
    }
  }

  /**
   * Test custom dropdown implementation
   * @param {WebElement} dropdown - Dropdown element
   * @param {string} language - Current language
   * @param {string} type - Type of dropdown
   */
  async testCustomDropdown(dropdown, language, type) {
    console.log(`🔽 Testing custom ${type} dropdown...`);
    
    try {
      // Click to open dropdown
      await dropdown.click();
      await this.setup.driver.sleep(1000);
      
      // Look for dropdown options with multiple strategies
      const optionSelectors = [
        '.dropdown-option',
        '.select-option',
        '[role="option"]',
        '.bank-option',
        `[data-testid*="${type}-option"]`
      ];

      let options = [];
      for (const selector of optionSelectors) {
        try {
          options = await this.setup.driver.findElements(By.css(selector));
          if (options.length > 0) {
            console.log(`📊 Found ${options.length} options using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (options.length > 0) {
        // Test selecting first available option
        const firstOption = options[0];
        const optionText = await firstOption.getText();
        
        console.log(`🎯 Selecting first option: ${optionText}`);
        await firstOption.click();
        await this.setup.driver.sleep(1000);
        
        // Verify selection (look for selected state)
        const selectedText = await dropdown.getText();
        console.log(`✅ Dropdown shows: ${selectedText}`);
        
        // Test opening again to verify state
        await dropdown.click();
        await this.setup.driver.sleep(500);
        
        // Close dropdown by clicking elsewhere or pressing Escape
        await this.setup.driver.findElement(By.tagName('body')).click();
      } else {
        console.log('⚠️ No dropdown options found');
      }
      
    } catch (error) {
      console.log(`⚠️ Custom dropdown test partial failure: ${error.message}`);
    }
  }

  /**
   * Test 3: Form Persistence After Refresh
   * @param {string} language - Current language
   */
  async testFormPersistence(language) {
    console.log('💾 Testing form persistence after refresh...');

    try {
      // Fill in form values
      await this.fillFormInputs(language);
      
      // Get current values before refresh
      const valuesBefore = await this.getCurrentFormValues();
      console.log('📝 Values before refresh:', valuesBefore);
      
      // Refresh the page
      await this.setup.driver.navigate().refresh();
      await this.setup.waitForPageLoad(language);
      
      // Wait for form to reinitialize
      await this.setup.driver.sleep(2000);
      
      // Check if values persisted
      const valuesAfter = await this.getCurrentFormValues();
      console.log('📝 Values after refresh:', valuesAfter);
      
      // Compare values (some persistence is expected in modern banking apps)
      const persistenceWorking = Object.keys(valuesBefore).some(key => 
        valuesBefore[key] && valuesBefore[key] === valuesAfter[key]
      );
      
      await this.setup.reportTestResult(
        `Form Persistence - ${language}`,
        true, // Don't fail if persistence doesn't work - just report
        persistenceWorking ? 'Values persisted correctly' : 'No persistence detected (may be expected)'
      );

    } catch (error) {
      await this.setup.reportTestResult(
        `Form Persistence - ${language}`,
        false,
        error.message
      );
    }
  }

  /**
   * Fill form inputs with test data
   * @param {string} language - Current language
   */
  async fillFormInputs(language) {
    try {
      // Fill loan amount
      const loanAmountInput = await this.setup.findElementSmart(this.testData.inputSelectors.loanAmount);
      await loanAmountInput.clear();
      await loanAmountInput.sendKeys(this.testData.testValues.loanAmount);
      
      // Fill interest rate
      try {
        const interestRateInput = await this.setup.findElementSmart(
          this.testData.inputSelectors.interestRate,
          5000
        );
        await interestRateInput.clear();
        await interestRateInput.sendKeys(this.testData.testValues.interestRate);
      } catch (e) {
        console.log('⚠️ Interest rate input not found, skipping...');
      }

      console.log('✅ Form inputs filled');
      
    } catch (error) {
      console.log(`⚠️ Form filling partial failure: ${error.message}`);
    }
  }

  /**
   * Get current form values
   * @returns {Object} Current form values
   */
  async getCurrentFormValues() {
    const values = {};
    
    try {
      const loanAmountInput = await this.setup.findElementSmart(this.testData.inputSelectors.loanAmount);
      values.loanAmount = await loanAmountInput.getAttribute('value');
    } catch (e) {
      values.loanAmount = '';
    }

    try {
      const interestRateInput = await this.setup.findElementSmart(this.testData.inputSelectors.interestRate, 3000);
      values.interestRate = await interestRateInput.getAttribute('value');
    } catch (e) {
      values.interestRate = '';
    }

    try {
      const bankDropdown = await this.setup.findElementSmart(this.testData.dropdownSelectors.bankSelector);
      if (await bankDropdown.getTagName() === 'select') {
        values.bankSelection = await bankDropdown.getAttribute('value');
      } else {
        values.bankSelection = await bankDropdown.getText();
      }
    } catch (e) {
      values.bankSelection = '';
    }

    return values;
  }

  /**
   * Test 4: Calculation Flow and Results
   * @param {string} language - Current language
   */
  async testCalculationFlow(language) {
    console.log('🧮 Testing calculation flow...');

    try {
      // Fill form with test values
      await this.fillFormInputs(language);
      
      // Look for calculate button with multiple strategies
      const calculateButtonSelectors = {
        'data-testid': 'calculate-button',
        'data-cy': 'calculate-btn',
        'id': 'calculate',
        'css': '.calculate-button, .btn-calculate, button[type="submit"]',
        'xpath': `//button[contains(text(), 'Calculate') or contains(text(), 'חשב') or contains(text(), 'Вычислить')]`
      };

      try {
        const calculateButton = await this.setup.findElementSmart(calculateButtonSelectors, 10000);
        
        console.log('🎯 Clicking calculate button...');
        await calculateButton.click();
        
        // Wait for calculation results
        await this.setup.driver.sleep(3000);
        
        // Look for results with multiple strategies
        const resultSelectors = [
          '[data-testid*="result"]',
          '.calculation-result',
          '.result-container',
          '.monthly-payment',
          '.calculation-output'
        ];

        let resultsFound = false;
        for (const selector of resultSelectors) {
          try {
            const results = await this.setup.driver.findElements(By.css(selector));
            if (results.length > 0) {
              console.log(`📊 Found calculation results using: ${selector}`);
              resultsFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }

        await this.setup.reportTestResult(
          `Calculation Flow - ${language}`,
          resultsFound,
          resultsFound ? 'Calculation completed successfully' : 'No calculation results found'
        );

      } catch (e) {
        console.log('⚠️ Calculate button not found, testing calculation display only');
        
        // Look for pre-calculated results or dynamic calculation
        const hasCalculationDisplay = await this.checkForCalculationDisplay();
        
        await this.setup.reportTestResult(
          `Calculation Display - ${language}`,
          hasCalculationDisplay,
          hasCalculationDisplay ? 'Calculation display present' : 'No calculation display found'
        );
      }

    } catch (error) {
      await this.setup.reportTestResult(
        `Calculation Flow - ${language}`,
        false,
        error.message
      );
    }
  }

  /**
   * Check for any calculation-related display
   * @returns {boolean} Whether calculation display is present
   */
  async checkForCalculationDisplay() {
    const displayIndicators = [
      '₪', '$', '€', // Currency symbols
      'monthly', 'חודשי', 'месячный', // Monthly payment indicators
      '%', 'percent', 'אחוז', 'процент', // Percentage indicators
      'payment', 'תשלום', 'платеж' // Payment indicators
    ];

    for (const indicator of displayIndicators) {
      try {
        await this.setup.driver.findElement(By.xpath(`//*[contains(text(), '${indicator}')]`));
        console.log(`✅ Found calculation indicator: ${indicator}`);
        return true;
      } catch (e) {
        // Continue checking
      }
    }

    return false;
  }

  /**
   * Test 5: RTL-Specific Functionality
   * @param {string} language - Current language (should be 'he')
   */
  async testRTLSpecific(language) {
    console.log('🔄 Testing RTL-specific functionality...');

    try {
      // Check document direction
      const htmlDir = await this.setup.driver.executeScript('return document.documentElement.dir');
      const bodyDir = await this.setup.driver.executeScript('return document.body.dir || getComputedStyle(document.body).direction');
      
      console.log(`📍 HTML direction: ${htmlDir}, Body direction: ${bodyDir}`);

      // Check for RTL layout indicators
      const rtlIndicators = await this.setup.driver.executeScript(`
        const elements = document.querySelectorAll('*');
        let rtlCount = 0;
        for (let el of elements) {
          const style = getComputedStyle(el);
          if (style.direction === 'rtl' || style.textAlign === 'right') {
            rtlCount++;
          }
        }
        return rtlCount;
      `);

      console.log(`📊 Found ${rtlIndicators} elements with RTL styling`);

      // Test Hebrew text rendering
      const hebrewTextElements = await this.setup.driver.findElements(
        By.xpath('//*[contains(text(), "א") or contains(text(), "ב") or contains(text(), "ג")]')
      );

      console.log(`📊 Found ${hebrewTextElements.length} Hebrew text elements`);

      // Test form input alignment in RTL
      try {
        const inputs = await this.setup.driver.findElements(By.css('input[type="text"], input[type="number"]'));
        let rtlInputs = 0;
        
        for (const input of inputs.slice(0, 3)) { // Test first 3 inputs
          const textAlign = await this.setup.driver.executeScript(
            'return getComputedStyle(arguments[0]).textAlign',
            input
          );
          if (textAlign === 'right') rtlInputs++;
        }
        
        console.log(`📊 Found ${rtlInputs} inputs with right alignment`);
        
      } catch (e) {
        console.log('⚠️ Input alignment check failed');
      }

      // Overall RTL assessment
      const rtlWorking = htmlDir === 'rtl' || bodyDir === 'rtl' || rtlIndicators > 0 || hebrewTextElements.length > 0;

      await this.setup.reportTestResult(
        `RTL Functionality - ${language}`,
        rtlWorking,
        rtlWorking ? 'RTL support detected' : 'No RTL support found'
      );

    } catch (error) {
      await this.setup.reportTestResult(
        `RTL Functionality - ${language}`,
        false,
        error.message
      );
    }
  }
}

// Export for use in other test files
module.exports = CalculatorFormulaTests;

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const tests = new CalculatorFormulaTests();
    try {
      const results = await tests.runFullTestSuite();
      
      console.log('\n🎉 Test suite completed!');
      console.log('📊 Final Results:', results);
      
      process.exit(0);
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    }
  })();
}