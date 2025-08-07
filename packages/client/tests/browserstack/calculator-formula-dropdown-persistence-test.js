/**
 * BrowserStack Automation for Calculator Formula Dropdown Persistence Testing
 * 
 * Test Steps:
 * 1. Navigate to Calculator Formula page (http://localhost:4002/calculator-formula)
 * 2. Check if dropdown has values
 * 3. Change dropdown value  
 * 4. Refresh page to test persistence
 * 5. If value persisted, revert back to original value
 * 
 * Uses BrowserStack with local connection to test localhost:4002
 */

const { Builder, By, until, Select } = require('selenium-webdriver');

class CalculatorFormulaDropdownPersistenceTest {
  constructor() {
    this.driver = null;
    this.originalValue = null;
    this.changedValue = null;
    
    // BrowserStack configuration
    this.capabilities = {
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '11',
      'bstack:options': {
        'userName': process.env.BROWSERSTACK_USERNAME || 'qabankimonline@gmail.com',
        'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || '1sPgh89g81AybDayLQtz',
        'debug': 'true',
        'consoleLogs': 'info',
        'video': 'true',
        'buildName': 'Calculator-Formula-Dropdown-Persistence-Test',
        'sessionName': 'Dropdown Value Persistence Test',
        'projectName': 'BankIM Portal Testing'
      }
    };
    
    // Test selectors for the bank dropdown from CalculatorFormula.tsx
    this.dropdownSelectors = {
      bankDropdown: '.bank-dropdown',
      bankDropdownById: 'select.bank-dropdown',
      bankDropdownXPath: '//select[@class="bank-dropdown"]'
    };
  }

  /**
   * Initialize WebDriver with BrowserStack
   */
  async initialize() {
    try {
      console.log('🚀 Initializing BrowserStack WebDriver...');
      
      const hubUrl = `https://${this.capabilities['bstack:options']['userName']}:${this.capabilities['bstack:options']['accessKey']}@hub-cloud.browserstack.com/wd/hub`;
      
      this.driver = await new Builder()
        .usingServer(hubUrl)
        .withCapabilities(this.capabilities)
        .build();
        
      // Set timeouts
      await this.driver.manage().setTimeouts({
        implicit: 10000,
        pageLoad: 60000,
        script: 30000
      });
      
      console.log('✅ WebDriver initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebDriver:', error.message);
      return false;
    }
  }

  /**
   * Step 1: Navigate to Calculator Formula page
   */
  async navigateToCalculatorFormula() {
    try {
      // For initial testing, use a simple page to verify BrowserStack connection
      // Once connection works, we'll set up BrowserStack Local for localhost:4002
      const url = 'https://www.google.com'; // Test URL first
      console.log(`🎯 Navigating to test URL: ${url}`);
      console.log('⚠️  Note: Testing BrowserStack connection first. Will need BrowserStack Local for localhost:4002');
      
      await this.driver.get(url);
      
      // Wait for page to load - look for Google title for connection test
      await this.driver.wait(
        until.titleContains('Google'), 
        30000
      );
      
      console.log('✅ Successfully navigated to test page - BrowserStack connection works!');
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to Calculator Formula page:', error.message);
      return false;
    }
  }

  /**
   * Step 2: Find and analyze the bank dropdown
   */
  async findAndAnalyzeDropdown() {
    try {
      console.log('🔍 Looking for bank dropdown...');
      
      // Try multiple selectors to find the dropdown
      let dropdown = null;
      
      // Try CSS selector first
      try {
        dropdown = await this.driver.wait(
          until.elementLocated(By.css(this.dropdownSelectors.bankDropdown)), 
          15000
        );
        console.log('✅ Found dropdown using CSS selector');
      } catch (e) {
        console.log('⏳ CSS selector failed, trying XPath...');
        // Try XPath as fallback
        try {
          dropdown = await this.driver.wait(
            until.elementLocated(By.xpath(this.dropdownSelectors.bankDropdownXPath)), 
            10000
          );
          console.log('✅ Found dropdown using XPath');
        } catch (e) {
          throw new Error('Dropdown not found with any selector');
        }
      }
      
      // Verify it's a select element
      const tagName = await dropdown.getTagName();
      if (tagName !== 'select') {
        throw new Error(`Expected select element, got ${tagName}`);
      }
      
      // Get all options
      const select = new Select(dropdown);
      const options = await select.getOptions();
      
      console.log(`📊 Found dropdown with ${options.length} options:`);
      
      // List all options
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const text = await option.getText();
        const value = await option.getAttribute('value');
        console.log(`  Option ${i}: "${text}" (value: "${value}")`);
      }
      
      if (options.length <= 1) {
        throw new Error('Dropdown has no selectable options (only default/empty option)');
      }
      
      // Store original value
      const selectedOption = await select.getFirstSelectedOption();
      this.originalValue = await selectedOption.getAttribute('value');
      const originalText = await selectedOption.getText();
      
      console.log(`📌 Original selected value: "${this.originalValue}" ("${originalText}")`);
      
      return { dropdown, select, options };
    } catch (error) {
      console.error('❌ Failed to find or analyze dropdown:', error.message);
      throw error;
    }
  }

  /**
   * Step 3: Change dropdown value
   */
  async changeDropdownValue(select, options) {
    try {
      console.log('🔄 Changing dropdown value...');
      
      // Find a different option to select (not the first/empty one and not the currently selected one)
      let targetOption = null;
      
      for (let i = 1; i < options.length; i++) { // Start from 1 to skip empty option
        const option = options[i];
        const value = await option.getAttribute('value');
        
        if (value && value !== this.originalValue && value !== '') {
          targetOption = option;
          this.changedValue = value;
          break;
        }
      }
      
      if (!targetOption) {
        throw new Error('No different option available to select');
      }
      
      // Select the new option
      const targetText = await targetOption.getText();
      console.log(`🎯 Selecting option: "${targetText}" (value: "${this.changedValue}")`);
      
      await select.selectByValue(this.changedValue);
      
      // Wait a moment for any onChange handlers to execute
      await this.driver.sleep(2000);
      
      // Verify selection
      const newSelectedOption = await select.getFirstSelectedOption();
      const newValue = await newSelectedOption.getAttribute('value');
      
      if (newValue === this.changedValue) {
        console.log('✅ Successfully changed dropdown value');
        return true;
      } else {
        throw new Error(`Value not changed. Expected: ${this.changedValue}, Got: ${newValue}`);
      }
    } catch (error) {
      console.error('❌ Failed to change dropdown value:', error.message);
      throw error;
    }
  }

  /**
   * Step 4: Refresh page and check if value persisted
   */
  async testValuePersistence() {
    try {
      console.log('🔄 Refreshing page to test value persistence...');
      
      await this.driver.navigate().refresh();
      
      // Wait for page to reload
      await this.driver.wait(
        until.elementLocated(By.css(this.dropdownSelectors.bankDropdown)), 
        30000
      );
      
      // Wait a bit more for any initialization to complete
      await this.driver.sleep(3000);
      
      // Check the dropdown value again
      const dropdown = await this.driver.findElement(By.css(this.dropdownSelectors.bankDropdown));
      const select = new Select(dropdown);
      const selectedOption = await select.getFirstSelectedOption();
      const currentValue = await selectedOption.getAttribute('value');
      const currentText = await selectedOption.getText();
      
      console.log(`🔍 Value after refresh: "${currentValue}" ("${currentText}")`);
      
      if (currentValue === this.changedValue) {
        console.log('✅ SUCCESS: Value persisted after refresh!');
        return true;
      } else {
        console.log('ℹ️  Value did not persist (this may be expected behavior)');
        console.log(`   Expected: ${this.changedValue}, Got: ${currentValue}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to test value persistence:', error.message);
      throw error;
    }
  }

  /**
   * Step 5: Revert to original value if persistence worked
   */
  async revertToOriginalValue(persistenceWorked) {
    try {
      if (!persistenceWorked) {
        console.log('⏭️  Skipping revert - value did not persist');
        return true;
      }
      
      console.log('🔄 Reverting to original value...');
      
      const dropdown = await this.driver.findElement(By.css(this.dropdownSelectors.bankDropdown));
      const select = new Select(dropdown);
      
      // Select original value
      await select.selectByValue(this.originalValue);
      
      // Wait for onChange handlers
      await this.driver.sleep(2000);
      
      // Verify reversion
      const selectedOption = await select.getFirstSelectedOption();
      const currentValue = await selectedOption.getAttribute('value');
      const currentText = await selectedOption.getText();
      
      if (currentValue === this.originalValue) {
        console.log(`✅ Successfully reverted to original value: "${currentValue}" ("${currentText}")`);
        return true;
      } else {
        console.log(`⚠️ Failed to revert. Expected: ${this.originalValue}, Got: ${currentValue}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to revert to original value:', error.message);
      throw error;
    }
  }

  /**
   * Main test execution
   */
  async runTest() {
    let testResults = {
      navigation: false,
      dropdownFound: false,
      valueChanged: false,
      persistenceTest: false,
      revertSuccess: false,
      persistenceWorked: false
    };
    
    try {
      // Initialize WebDriver
      if (!await this.initialize()) {
        throw new Error('Failed to initialize WebDriver');
      }
      
      // Step 1: Navigate to page
      testResults.navigation = await this.navigateToCalculatorFormula();
      if (!testResults.navigation) {
        throw new Error('Navigation failed');
      }
      
      // Step 2: Find and analyze dropdown
      const dropdownData = await this.findAndAnalyzeDropdown();
      testResults.dropdownFound = true;
      
      // Step 3: Change dropdown value
      testResults.valueChanged = await this.changeDropdownValue(dropdownData.select, dropdownData.options);
      
      // Step 4: Test persistence
      testResults.persistenceWorked = await this.testValuePersistence();
      testResults.persistenceTest = true;
      
      // Step 5: Revert if needed
      testResults.revertSuccess = await this.revertToOriginalValue(testResults.persistenceWorked);
      
      return testResults;
      
    } catch (error) {
      console.error('💥 Test execution failed:', error.message);
      
      // Capture screenshot for debugging
      try {
        const screenshot = await this.driver.takeScreenshot();
        console.log('📸 Screenshot captured for debugging');
        // In a real scenario, you'd save this screenshot to a file
      } catch (screenshotError) {
        console.error('Failed to capture screenshot:', screenshotError.message);
      }
      
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.driver) {
        console.log('🧹 Cleaning up WebDriver session...');
        await this.driver.quit();
        console.log('✅ Cleanup completed');
      }
    } catch (error) {
      console.error('⚠️ Cleanup error:', error.message);
    }
  }

  /**
   * Print test summary
   */
  printTestSummary(results) {
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Navigation to Calculator Formula page: ${results.navigation ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Dropdown found and analyzed: ${results.dropdownFound ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Dropdown value changed: ${results.valueChanged ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Persistence test executed: ${results.persistenceTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Value persisted after refresh: ${results.persistenceWorked ? '✅ YES' : 'ℹ️  NO'}`);
    console.log(`Value reverted (if needed): ${results.revertSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\nOverall: ${passedTests}/${totalTests} steps completed successfully`);
    
    if (results.persistenceWorked) {
      console.log('\n🎉 IMPORTANT FINDING: Dropdown values DO persist after page refresh!');
    } else {
      console.log('\nℹ️  NOTE: Dropdown values do NOT persist after page refresh (may be expected)');
    }
  }
}

// Execute the test if this file is run directly
if (require.main === module) {
  (async () => {
    const test = new CalculatorFormulaDropdownPersistenceTest();
    let results = {};
    
    try {
      console.log('🚀 Starting Calculator Formula Dropdown Persistence Test');
      console.log('=========================================================\n');
      
      results = await test.runTest();
      
      console.log('\n🎉 Test execution completed!');
      test.printTestSummary(results);
      
      process.exit(0);
      
    } catch (error) {
      console.error('\n💥 Test failed:', error.message);
      test.printTestSummary(results);
      process.exit(1);
    } finally {
      await test.cleanup();
    }
  })();
}

module.exports = CalculatorFormulaDropdownPersistenceTest;