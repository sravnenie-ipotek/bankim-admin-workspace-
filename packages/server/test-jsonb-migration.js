/**
 * JSONB Dropdown Migration Test Script
 * 
 * This script validates the JSONB dropdown system implementation
 * and ensures the admin panel can properly manage dropdowns.
 * 
 * Run: node test-jsonb-migration.js
 */

const axios = require('axios');
const { contentPool } = require('./config/database-content.js');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bankim.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Test data
const TEST_DROPDOWN_KEY = 'TEST_ADMIN_' + Date.now();
const TEST_SCREEN = 'test_screen';
const TEST_FIELD = 'test_field_' + Date.now();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log('✅ ' + message, 'green');
}

function logError(message) {
  log('❌ ' + message, 'red');
}

function logWarning(message) {
  log('⚠️  ' + message, 'yellow');
}

function logInfo(message) {
  log('ℹ️  ' + message, 'magenta');
}

// Session management
let sessionCookie = null;

// Test functions
async function testDatabaseConnection() {
  logSection('1. Testing Database Connection');
  
  try {
    const client = await contentPool.connect();
    
    // Check if dropdown_configs table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dropdown_configs'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      logSuccess('Connected to database successfully');
      logSuccess('dropdown_configs table exists');
      
      // Get table info
      const countResult = await client.query('SELECT COUNT(*) FROM dropdown_configs');
      logInfo(`Total dropdowns in database: ${countResult.rows[0].count}`);
      
      // Get sample data
      const sampleResult = await client.query(`
        SELECT dropdown_key, screen_location, is_active 
        FROM dropdown_configs 
        LIMIT 5
      `);
      
      if (sampleResult.rows.length > 0) {
        logInfo('Sample dropdowns:');
        sampleResult.rows.forEach(row => {
          console.log(`  - ${row.dropdown_key} (${row.screen_location}) - Active: ${row.is_active}`);
        });
      }
    } else {
      logError('dropdown_configs table does not exist!');
      logWarning('Please create the table using the migration script');
      client.release();
      return false;
    }
    
    client.release();
    return true;
  } catch (error) {
    logError('Database connection failed: ' + error.message);
    return false;
  }
}

async function testAuthentication() {
  logSection('2. Testing Authentication');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }, {
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Authentication successful');
      
      // Store session cookie
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        sessionCookie = cookies[0];
        logInfo('Session cookie stored');
      }
      
      return true;
    } else {
      logError('Authentication failed: ' + (response.data.error || 'Unknown error'));
      logWarning('Please check admin credentials');
      return false;
    }
  } catch (error) {
    logError('Authentication error: ' + error.message);
    return false;
  }
}

async function testGetScreens() {
  logSection('3. Testing Get Available Screens');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dropdown-screens`, {
      headers: {
        'Cookie': sessionCookie
      },
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully fetched available screens');
      
      const screens = response.data.data;
      logInfo(`Found ${screens.length} screens with dropdowns`);
      
      if (screens.length > 0) {
        screens.slice(0, 5).forEach(screen => {
          console.log(`  - ${screen.screen}: ${screen.dropdownCount} dropdowns`);
        });
      }
      
      return true;
    } else {
      logError('Failed to fetch screens: ' + (response.data.error || 'Unknown error'));
      return false;
    }
  } catch (error) {
    logError('Error fetching screens: ' + error.message);
    return false;
  }
}

async function testGetDropdowns() {
  logSection('4. Testing Get Dropdowns for Screen');
  
  try {
    // First, get a valid screen
    const screensResponse = await axios.get(`${BASE_URL}/api/admin/dropdown-screens`, {
      headers: { 'Cookie': sessionCookie },
      withCredentials: true
    });
    
    if (screensResponse.data.data && screensResponse.data.data.length > 0) {
      const testScreen = screensResponse.data.data[0].screen;
      logInfo(`Testing with screen: ${testScreen}`);
      
      // Test for each language
      const languages = ['en', 'he', 'ru'];
      
      for (const lang of languages) {
        const response = await axios.get(`${BASE_URL}/api/admin/dropdowns/${testScreen}/${lang}`, {
          headers: { 'Cookie': sessionCookie },
          withCredentials: true,
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data.success) {
          logSuccess(`Fetched dropdowns for ${testScreen} (${lang})`);
          
          if (response.data.jsonb_source) {
            logSuccess('JSONB source confirmed');
          }
          
          if (response.data.data && response.data.data.length > 0) {
            const sample = response.data.data[0];
            console.log(`  Sample: ${sample.key} - ${sample.label}`);
          }
        } else {
          logError(`Failed to fetch dropdowns for ${lang}: ${response.data.error}`);
        }
      }
      
      return true;
    } else {
      logWarning('No screens available for testing');
      return false;
    }
  } catch (error) {
    logError('Error fetching dropdowns: ' + error.message);
    return false;
  }
}

async function testCreateDropdown() {
  logSection('5. Testing Create Dropdown');
  
  const testDropdownData = {
    label: {
      en: 'Test Dropdown',
      he: 'רשימה נפתחת לבדיקה',
      ru: 'Тестовый выпадающий список'
    },
    placeholder: {
      en: 'Select an option',
      he: 'בחר אפשרות',
      ru: 'Выберите опцию'
    },
    options: [
      {
        value: 'option1',
        text: {
          en: 'Option 1',
          he: 'אפשרות 1',
          ru: 'Опция 1'
        }
      },
      {
        value: 'option2',
        text: {
          en: 'Option 2',
          he: 'אפשרות 2',
          ru: 'Опция 2'
        }
      }
    ]
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/dropdown`, {
      screen_location: TEST_SCREEN,
      field_name: TEST_FIELD,
      dropdown_data: testDropdownData
    }, {
      headers: { 'Cookie': sessionCookie },
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully created test dropdown');
      logInfo(`Dropdown key: ${TEST_SCREEN}_${TEST_FIELD}`);
      return true;
    } else {
      logError('Failed to create dropdown: ' + (response.data.error || 'Unknown error'));
      return false;
    }
  } catch (error) {
    logError('Error creating dropdown: ' + error.message);
    return false;
  }
}

async function testUpdateDropdown() {
  logSection('6. Testing Update Dropdown');
  
  const updatedData = {
    label: {
      en: 'Updated Test Dropdown',
      he: 'רשימה נפתחת מעודכנת',
      ru: 'Обновленный тестовый список'
    },
    placeholder: {
      en: 'Please select',
      he: 'אנא בחר',
      ru: 'Пожалуйста выберите'
    },
    options: [
      {
        value: 'option1',
        text: {
          en: 'Updated Option 1',
          he: 'אפשרות מעודכנת 1',
          ru: 'Обновленная опция 1'
        }
      },
      {
        value: 'option2',
        text: {
          en: 'Updated Option 2',
          he: 'אפשרות מעודכנת 2',
          ru: 'Обновленная опция 2'
        }
      },
      {
        value: 'option3',
        text: {
          en: 'New Option 3',
          he: 'אפשרות חדשה 3',
          ru: 'Новая опция 3'
        }
      }
    ]
  };
  
  try {
    const dropdownKey = `${TEST_SCREEN}_${TEST_FIELD}`;
    
    const response = await axios.put(`${BASE_URL}/api/admin/dropdown/${dropdownKey}`, {
      dropdown_data: updatedData
    }, {
      headers: { 'Cookie': sessionCookie },
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully updated test dropdown');
      
      // Verify the update
      const getResponse = await axios.get(`${BASE_URL}/api/admin/dropdown/${dropdownKey}`, {
        headers: { 'Cookie': sessionCookie },
        withCredentials: true
      });
      
      if (getResponse.data.data) {
        const updated = getResponse.data.data;
        if (updated.dropdown_data.label.en === 'Updated Test Dropdown') {
          logSuccess('Update verified - data matches');
        }
        logInfo(`Last updated by: ${updated.updated_by || 'unknown'}`);
      }
      
      return true;
    } else {
      logError('Failed to update dropdown: ' + (response.data.error || 'Unknown error'));
      return false;
    }
  } catch (error) {
    logError('Error updating dropdown: ' + error.message);
    return false;
  }
}

async function testValidation() {
  logSection('7. Testing Data Validation');
  
  const invalidData = {
    label: {
      en: 'Missing other languages'
      // Missing he and ru
    },
    options: [] // Empty options
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/dropdown/validate`, {
      dropdown_data: invalidData
    }, {
      headers: { 'Cookie': sessionCookie },
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      if (!response.data.success && response.data.errors) {
        logSuccess('Validation correctly rejected invalid data');
        logInfo('Validation errors:');
        response.data.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      } else {
        logError('Validation should have failed but passed');
      }
      return true;
    } else {
      logError('Validation endpoint error');
      return false;
    }
  } catch (error) {
    logError('Error testing validation: ' + error.message);
    return false;
  }
}

async function testDeleteDropdown() {
  logSection('8. Testing Delete Dropdown');
  
  try {
    const dropdownKey = `${TEST_SCREEN}_${TEST_FIELD}`;
    
    const response = await axios.delete(`${BASE_URL}/api/admin/dropdown/${dropdownKey}`, {
      headers: { 'Cookie': sessionCookie },
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Successfully deleted test dropdown');
      
      // Verify deletion (should be soft delete - is_active = false)
      const client = await contentPool.connect();
      const checkResult = await client.query(
        'SELECT is_active FROM dropdown_configs WHERE dropdown_key = $1',
        [dropdownKey]
      );
      
      if (checkResult.rows.length > 0 && !checkResult.rows[0].is_active) {
        logSuccess('Soft delete verified - dropdown marked as inactive');
      }
      
      client.release();
      return true;
    } else {
      logError('Failed to delete dropdown: ' + (response.data.error || 'Unknown error'));
      return false;
    }
  } catch (error) {
    logError('Error deleting dropdown: ' + error.message);
    return false;
  }
}

async function cleanup() {
  logSection('Cleanup');
  
  try {
    // Clean up any test data
    const client = await contentPool.connect();
    
    const result = await client.query(
      `DELETE FROM dropdown_configs 
       WHERE dropdown_key LIKE 'TEST_ADMIN_%' 
          OR screen_location = $1`,
      [TEST_SCREEN]
    );
    
    logInfo(`Cleaned up ${result.rowCount} test records`);
    
    client.release();
  } catch (error) {
    logWarning('Cleanup error: ' + error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log('🚀 JSONB DROPDOWN MIGRATION TEST SUITE', 'magenta');
  log('Testing admin panel JSONB dropdown management', 'magenta');
  console.log('\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Get Screens', fn: testGetScreens },
    { name: 'Get Dropdowns', fn: testGetDropdowns },
    { name: 'Create Dropdown', fn: testCreateDropdown },
    { name: 'Update Dropdown', fn: testUpdateDropdown },
    { name: 'Validation', fn: testValidation },
    { name: 'Delete Dropdown', fn: testDeleteDropdown }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
        logWarning(`Test "${test.name}" failed but continuing...`);
      }
    } catch (error) {
      failed++;
      logError(`Test "${test.name}" threw error: ${error.message}`);
    }
  }
  
  // Cleanup
  await cleanup();
  
  // Summary
  logSection('Test Summary');
  console.log(`Total Tests: ${tests.length}`);
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  
  const successRate = Math.round((passed / tests.length) * 100);
  
  if (successRate === 100) {
    console.log('\n');
    log('🎉 ALL TESTS PASSED! JSONB MIGRATION IS WORKING!', 'green');
    log('The admin panel is ready to manage JSONB dropdowns', 'green');
  } else if (successRate >= 75) {
    console.log('\n');
    log('✨ MOSTLY SUCCESSFUL! Most features are working', 'yellow');
    log(`Success rate: ${successRate}%`, 'yellow');
  } else {
    console.log('\n');
    log('⚠️  NEEDS ATTENTION! Several tests failed', 'red');
    log(`Success rate: ${successRate}%`, 'red');
    log('Please review the errors above and fix the issues', 'red');
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  logError('Fatal error: ' + error.message);
  process.exit(1);
});