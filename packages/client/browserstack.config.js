/**
 * BrowserStack Configuration for Multilingual Banking Portal
 * Optimized for Calculator Formula testing with RTL language support
 */

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'your_username';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'your_access_key';
const BUILD_NAME = process.env.BUILD_NAME || `BankIM-Portal-${Date.now()}`;
const LOCAL_IDENTIFIER = process.env.BROWSERSTACK_LOCAL_IDENTIFIER || 'bankim-local';

// Cross-browser testing matrix optimized for banking applications
const browserMatrix = {
  // Desktop browsers - Primary testing targets
  desktop: [
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
      resolution: '1920x1080',
      'bstack:options': {
        seleniumVersion: '4.15.0',
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose',
        timezone: 'UTC'
      }
    },
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
      resolution: '1920x1080',
      'bstack:options': {
        seleniumVersion: '4.15.0',
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose'
      }
    },
    {
      browserName: 'Safari',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Sonoma',
      resolution: '1920x1080',
      'bstack:options': {
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose'
      }
    },
    {
      browserName: 'Edge',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
      resolution: '1920x1080',
      'bstack:options': {
        seleniumVersion: '4.15.0',
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose'
      }
    }
  ],

  // Mobile browsers - Critical for banking accessibility
  mobile: [
    {
      deviceName: 'iPhone 15',
      platformName: 'iOS',
      platformVersion: '17',
      browserName: 'Safari',
      'bstack:options': {
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose',
        appiumVersion: '2.0.0'
      }
    },
    {
      deviceName: 'Samsung Galaxy S24',
      platformName: 'Android',
      platformVersion: '14.0',
      browserName: 'Chrome',
      'bstack:options': {
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose',
        appiumVersion: '2.0.0'
      }
    }
  ],

  // RTL Testing Configuration
  rtl: [
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
      resolution: '1920x1080',
      'bstack:options': {
        seleniumVersion: '4.15.0',
        local: 'true',
        localIdentifier: LOCAL_IDENTIFIER,
        networkLogs: 'true',
        consoleLogs: 'verbose',
        timezone: 'Asia/Jerusalem',
        // Enable Hebrew language support
        chromeOptions: {
          args: ['--lang=he', '--accept-lang=he-IL,he,en']
        }
      }
    }
  ]
};

// Advanced wait and timeout configurations
const timeouts = {
  implicit: 10000,
  explicit: 30000,
  page_load: 60000,
  script: 30000,
  // Banking-specific timeouts
  form_submission: 45000,
  dropdown_load: 15000,
  calculation: 20000
};

// Element location strategies optimized for multilingual content
const locatorStrategies = {
  // Priority order for element location
  primary: ['data-testid', 'data-cy', 'id'],
  secondary: ['name', 'className'],
  fallback: ['xpath', 'css'],
  
  // RTL-specific strategies
  rtl: {
    textContent: 'contains',  // Use contains for partial matches
    direction: 'rtl',
    alignment: 'right'
  }
};

module.exports = {
  BROWSERSTACK_USERNAME,
  BROWSERSTACK_ACCESS_KEY,
  BUILD_NAME,
  LOCAL_IDENTIFIER,
  browserMatrix,
  timeouts,
  locatorStrategies,
  
  // Hub URL
  hubUrl: `https://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`,
  
  // Common capabilities
  commonCaps: {
    'bstack:options': {
      projectName: 'BankIM Management Portal',
      buildName: BUILD_NAME,
      sessionName: 'Calculator Formula Tests',
      local: 'true',
      localIdentifier: LOCAL_IDENTIFIER,
      debug: 'true',
      networkLogs: 'true',
      consoleLogs: 'verbose',
      video: 'true',
      seleniumVersion: '4.15.0'
    }
  }
};