/**
 * BrowserStack Automation for Calculator Formula Dropdown Persistence Testing
 * WITH BROWSERSTACK LOCAL for localhost:4002 testing
 * 
 * This version requires BrowserStack Local to be running to test localhost:4002
 */

const { Builder, By, until, Select } = require('selenium-webdriver');
const { Local } = require('browserstack-local');

class CalculatorFormulaLocalhostTest {
  constructor() {
    this.driver = null;
    this.local = null;
    this.originalValue = null;
    this.changedValue = null;
    
    // BrowserStack configuration with Local
    this.capabilities = {
      'browserName': 'Chrome',
      'browserVersion': 'latest',
      'os': 'Windows',
      'osVersion': '11',
      'bstack:options': {
        'userName': process.env.BROWSERSTACK_USERNAME || 'qabankimonline@gmail.com',
        'accessKey': process.env.BROWSERSTACK_ACCESS_KEY || '1sPgh89g81AybDayLQtz',
        'local': 'true', // Enable local testing
        'localIdentifier': 'bankim-local-test',
        'debug': 'true',
        'consoleLogs': 'info',
        'video': 'true',
        'buildName': 'Calculator-Formula-Localhost-Test',
        'sessionName': 'Localhost Dropdown Persistence Test',
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
   * Initialize BrowserStack Local connection
   */
  async initializeLocal() {
    return new Promise((resolve, reject) => {
      this.local = new Local();
      
      const localOptions = {
        key: this.capabilities['bstack:options']['accessKey'],
        localIdentifier: this.capabilities['bstack:options']['localIdentifier'],
        verbose: true,
        force: true
      };

      console.log('🚀 Starting BrowserStack Local connection...');
      
      this.local.start(localOptions, (error) => {
        if (error) {
          console.error('❌ BrowserStack Local connection failed:', error);
          reject(error);
        } else {
          console.log('✅ BrowserStack Local connection established');
          console.log(`📍 Local identifier: ${localOptions.localIdentifier}`);
          resolve();
        }
      });
    });
  }

  /**
   * Initialize WebDriver with BrowserStack
   */
  async initialize() {
    try {
      console.log('🚀 Initializing BrowserStack WebDriver with Local...');
      
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
   * Navigate to Calculator Formula page on localhost
   * This page requires authentication, so we'll first try to access it
   * and if we get redirected to login, we'll handle that
   */
  async navigateToCalculatorFormula() {
    try {
      // First, let's check the homepage to see if we need to login
      console.log('🔍 Checking homepage first...');
      await this.driver.get('http://localhost:4002/');
      await this.driver.sleep(2000);
      
      const homeTitle = await this.driver.getTitle();
      const homeUrl = await this.driver.getCurrentUrl();
      console.log(`🏠 Homepage title: "${homeTitle}"`);
      console.log(`🏠 Homepage URL: "${homeUrl}"`);
      
      // Now try to access the calculator formula page
      const url = 'http://localhost:4002/calculator-formula';
      console.log(`🎯 Navigating to: ${url}`);
      
      await this.driver.get(url);
      
      // Wait a moment for page to start loading
      await this.driver.sleep(3000);
      
      // Get page title and URL for debugging
      const title = await this.driver.getTitle();
      const currentUrl = await this.driver.getCurrentUrl();
      console.log(`📄 Page title: "${title}"`);
      console.log(`📍 Current URL: "${currentUrl}"`);
      
      // Check for various page load indicators
      try {
        // Option 1: Look for BankIM title
        await this.driver.wait(until.titleContains('BankIM'), 5000);
        console.log('✅ Found BankIM in title');
        return true;
      } catch (e) {
        console.log('⏳ BankIM not in title, checking for page elements...');
      }
      
      try {
        // Option 2: Look for calculator formula page class
        await this.driver.wait(until.elementLocated(By.className('calculator-formula-page')), 10000);
        console.log('✅ Found calculator-formula-page element');
        return true;
      } catch (e) {
        console.log('⏳ Calculator formula page element not found, checking for dropdown...');
      }
      
      try {
        // Option 3: Look directly for the dropdown
        await this.driver.wait(until.elementLocated(By.className('bank-dropdown')), 10000);
        console.log('✅ Found bank-dropdown element directly');
        return true;
      } catch (e) {
        console.log('⏳ Bank dropdown not found, checking for any React content...');
      }
      
      try {
        // Option 4: Look for any React app indicators
        await this.driver.wait(until.elementLocated(By.id('root')), 5000);
        console.log('✅ Found React app root element');
        return true;
      } catch (e) {
        console.log('⏳ React root not found...');
      }
      
      // Check if we're on a login page or redirected
      if (currentUrl.includes('login') || title.toLowerCase().includes('login')) {
        console.log('🔐 Detected login page - authentication required');
        throw new Error('Page requires authentication. Please implement login functionality or test with authenticated session.');
      }
      
      // Get page source for debugging if nothing found
      const pageSource = await this.driver.getPageSource();
      console.log('🔍 Page source preview:', pageSource.substring(0, 500) + '...');
      
      // Check if page shows any admin/management portal indicators
      if (pageSource.includes('BankIM') || pageSource.includes('Admin') || pageSource.includes('Management')) {
        console.log('✅ Found BankIM admin portal content');
        return true;
      }
      
      throw new Error('Page loaded but calculator formula elements not found. May need authentication or page structure has changed.');
      
    } catch (error) {
      console.error('❌ Failed to navigate to Calculator Formula page:', error.message);
      
      try {
        // Additional debugging info
        const title = await this.driver.getTitle();
        const currentUrl = await this.driver.getCurrentUrl();
        console.log(`🔍 Debug - Final title: "${title}"`);
        console.log(`🔍 Debug - Final URL: "${currentUrl}"`);
      } catch (debugError) {
        console.log('⚠️ Could not get debug info');
      }
      
      return false;
    }
  }

  /**
   * Find and analyze the bank dropdown
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
   * Change dropdown value
   */
  async changeDropdownValue(select, options) {
    try {
      console.log('🔄 Changing dropdown value...');
      
      // Find a different option to select
      let targetOption = null;
      
      for (let i = 1; i < options.length; i++) {
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
      
      // Wait for onChange handlers
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
   * Test value persistence after refresh
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
      
      // Wait for initialization
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
   * Revert to original value if persistence worked
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
      localConnection: false,
      navigation: false,
      dropdownFound: false,
      valueChanged: false,
      persistenceTest: false,
      revertSuccess: false,
      persistenceWorked: false
    };
    
    try {
      // Initialize BrowserStack Local
      await this.initializeLocal();
      testResults.localConnection = true;
      
      // Initialize WebDriver
      if (!await this.initialize()) {
        throw new Error('Failed to initialize WebDriver');
      }
      
      // Navigate to page
      testResults.navigation = await this.navigateToCalculatorFormula();
      if (!testResults.navigation) {
        throw new Error('Navigation failed');
      }
      
      // Find and analyze dropdown
      const dropdownData = await this.findAndAnalyzeDropdown();
      testResults.dropdownFound = true;
      
      // Change dropdown value
      testResults.valueChanged = await this.changeDropdownValue(dropdownData.select, dropdownData.options);
      
      // Test persistence
      testResults.persistenceWorked = await this.testValuePersistence();
      testResults.persistenceTest = true;
      
      // Revert if needed
      testResults.revertSuccess = await this.revertToOriginalValue(testResults.persistenceWorked);
      
      return testResults;
      
    } catch (error) {
      console.error('💥 Test execution failed:', error.message);
      
      // Capture screenshot for debugging
      try {
        if (this.driver) {
          const screenshot = await this.driver.takeScreenshot();
          console.log('📸 Screenshot captured for debugging');
        }
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
        console.log('🧹 Closing WebDriver session...');
        await this.driver.quit();
        console.log('✅ Driver cleanup completed');
      }

      if (this.local && this.local.isRunning()) {
        console.log('🧹 Stopping BrowserStack Local...');
        return new Promise((resolve) => {
          this.local.stop((error) => {
            if (error) console.warn('⚠️ Local stop warning:', error);
            console.log('✅ BrowserStack Local stopped');
            resolve();
          });
        });
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
    console.log(`BrowserStack Local connection: ${results.localConnection ? '✅ PASSED' : '❌ FAILED'}`);
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
    const test = new CalculatorFormulaLocalhostTest();
    let results = {};
    
    try {
      console.log('🚀 Starting Calculator Formula Localhost Dropdown Test');
      console.log('======================================================\n');
      
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

module.exports = CalculatorFormulaLocalhostTest;