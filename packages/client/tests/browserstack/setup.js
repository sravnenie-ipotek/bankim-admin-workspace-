/**
 * BrowserStack Test Setup and Utilities
 * Comprehensive setup for multilingual banking portal testing
 */

const { Builder, By, until, WebDriver } = require('selenium-webdriver');
const { Local } = require('browserstack-local');
const config = require('../../browserstack.config.js');

class BrowserStackSetup {
  constructor() {
    this.driver = null;
    this.local = null;
    this.currentLanguage = 'en';
    this.testResults = [];
  }

  /**
   * Initialize BrowserStack Local connection for localhost testing
   */
  async initializeLocal() {
    return new Promise((resolve, reject) => {
      this.local = new Local();
      
      const localOptions = {
        key: config.BROWSERSTACK_ACCESS_KEY,
        localIdentifier: config.LOCAL_IDENTIFIER,
        verbose: true,
        force: true,
        // Enable local testing for localhost:4002
        forceLocal: true,
        onlyAutomate: true
      };

      console.log('🚀 Starting BrowserStack Local connection...');
      
      this.local.start(localOptions, (error) => {
        if (error) {
          console.error('❌ BrowserStack Local connection failed:', error);
          reject(error);
        } else {
          console.log('✅ BrowserStack Local connection established');
          console.log(`📍 Local identifier: ${config.LOCAL_IDENTIFIER}`);
          resolve();
        }
      });
    });
  }

  /**
   * Create WebDriver instance with optimized capabilities
   * @param {string} browserType - desktop, mobile, or rtl
   * @param {number} browserIndex - Index in the browser matrix
   */
  async createDriver(browserType = 'desktop', browserIndex = 0) {
    try {
      const capabilities = {
        ...config.browserMatrix[browserType][browserIndex],
        ...config.commonCaps
      };

      console.log(`🌐 Creating ${browserType} driver:`, capabilities.browserName || capabilities.deviceName);

      this.driver = await new Builder()
        .usingServer(config.hubUrl)
        .withCapabilities(capabilities)
        .build();

      // Set timeouts
      await this.driver.manage().setTimeouts(config.timeouts);

      // Configure for RTL if needed
      if (browserType === 'rtl' || this.currentLanguage === 'he') {
        await this.configureRTL();
      }

      console.log('✅ Driver created successfully');
      return this.driver;
    } catch (error) {
      console.error('❌ Failed to create driver:', error);
      throw error;
    }
  }

  /**
   * Configure browser for RTL language testing
   */
  async configureRTL() {
    try {
      // Set Hebrew locale if supported
      await this.driver.executeScript(`
        document.documentElement.lang = 'he';
        document.documentElement.dir = 'rtl';
      `);
      console.log('🔄 RTL configuration applied');
    } catch (error) {
      console.warn('⚠️ RTL configuration partial failure:', error.message);
    }
  }

  /**
   * Navigate to Calculator Formula page with language support
   * @param {string} language - Language code (en, he, ru)
   */
  async navigateToCalculatorFormula(language = 'en') {
    this.currentLanguage = language;
    const baseUrl = 'http://localhost:4002';
    const url = `${baseUrl}/calculator-formula?lang=${language}`;
    
    try {
      console.log(`🎯 Navigating to Calculator Formula (${language}): ${url}`);
      await this.driver.get(url);
      
      // Wait for page load with language-specific indicators
      await this.waitForPageLoad(language);
      
      console.log('✅ Navigation successful');
      return true;
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      throw error;
    }
  }

  /**
   * Advanced wait for page load with multilingual support
   * @param {string} language - Current language
   */
  async waitForPageLoad(language = 'en') {
    const pageLoadIndicators = {
      en: ['Calculator', 'Formula', 'Bank'],
      he: ['מחשבון', 'נוסחה', 'בנק'],
      ru: ['Калькулятор', 'Формула', 'Банк']
    };

    try {
      // Wait for basic DOM ready
      await this.driver.wait(until.elementLocated(By.tagName('body')), config.timeouts.explicit);
      
      // Wait for language-specific content
      const indicators = pageLoadIndicators[language] || pageLoadIndicators.en;
      
      for (const indicator of indicators) {
        try {
          await this.driver.wait(
            until.elementLocated(By.xpath(`//*[contains(text(), '${indicator}')]`)),
            5000
          );
          console.log(`✅ Found language indicator: ${indicator}`);
          break;
        } catch (e) {
          console.log(`⏳ Looking for indicator: ${indicator}`);
        }
      }

      // Wait for interactive state
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, config.timeouts.page_load);

      console.log('✅ Page fully loaded');
    } catch (error) {
      console.warn('⚠️ Page load verification incomplete:', error.message);
    }
  }

  /**
   * Smart element finder with multilingual support and multiple strategies
   * @param {Object} locators - Object with different locator strategies
   * @param {number} timeout - Wait timeout
   */
  async findElementSmart(locators, timeout = config.timeouts.explicit) {
    const strategies = config.locatorStrategies.primary.concat(
      config.locatorStrategies.secondary,
      config.locatorStrategies.fallback
    );

    for (const strategy of strategies) {
      if (locators[strategy]) {
        try {
          let element;
          
          switch (strategy) {
            case 'data-testid':
              element = await this.driver.wait(
                until.elementLocated(By.css(`[data-testid="${locators[strategy]}"]`)),
                timeout / strategies.length
              );
              break;
            case 'data-cy':
              element = await this.driver.wait(
                until.elementLocated(By.css(`[data-cy="${locators[strategy]}"]`)),
                timeout / strategies.length
              );
              break;
            case 'id':
              element = await this.driver.wait(
                until.elementLocated(By.id(locators[strategy])),
                timeout / strategies.length
              );
              break;
            case 'name':
              element = await this.driver.wait(
                until.elementLocated(By.name(locators[strategy])),
                timeout / strategies.length
              );
              break;
            case 'className':
              element = await this.driver.wait(
                until.elementLocated(By.className(locators[strategy])),
                timeout / strategies.length
              );
              break;
            case 'xpath':
              element = await this.driver.wait(
                until.elementLocated(By.xpath(locators[strategy])),
                timeout / strategies.length
              );
              break;
            case 'css':
              element = await this.driver.wait(
                until.elementLocated(By.css(locators[strategy])),
                timeout / strategies.length
              );
              break;
          }

          if (element) {
            console.log(`✅ Element found using ${strategy}: ${locators[strategy]}`);
            return element;
          }
        } catch (error) {
          console.log(`⏳ Strategy ${strategy} failed, trying next...`);
        }
      }
    }

    throw new Error(`Element not found with any strategy: ${JSON.stringify(locators)}`);
  }

  /**
   * Test result reporting with BrowserStack integration
   * @param {string} testName - Name of the test
   * @param {boolean} passed - Test result
   * @param {string} reason - Failure reason if any
   */
  async reportTestResult(testName, passed, reason = '') {
    const result = {
      name: testName,
      passed,
      reason,
      timestamp: new Date().toISOString(),
      language: this.currentLanguage
    };

    this.testResults.push(result);

    try {
      // Mark test status in BrowserStack
      await this.driver.executeScript(
        `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"${passed ? 'passed' : 'failed'}", "reason": "${reason}"}}`
      );
      
      console.log(`📊 Test result reported: ${testName} - ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (!passed) console.log(`❌ Reason: ${reason}`);
      
    } catch (error) {
      console.warn('⚠️ Failed to report test result to BrowserStack:', error.message);
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
        this.driver = null;
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
      console.error('❌ Cleanup error:', error);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => r.failed).length;
    
    console.log('\n📊 Test Execution Report');
    console.log('========================');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name} (${result.language}): ${result.reason}`);
      });
    }
    
    return this.testResults;
  }
}

module.exports = BrowserStackSetup;