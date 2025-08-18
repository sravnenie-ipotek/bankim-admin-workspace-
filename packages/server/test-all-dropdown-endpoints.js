#!/usr/bin/env node
/**
 * Test script for all dropdown options endpoints
 * Tests mortgage, mortgage-refi, credit, and credit-refi dropdown endpoints
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000';

// Test configurations for all content types
const TEST_CONFIGS = [
  {
    name: 'Mortgage Dropdown Options',
    endpoint: '/api/content/mortgage/calculate_mortgage_main_income_source/options',
    contentType: 'mortgage'
  },
  {
    name: 'Mortgage-Refi Dropdown Options',
    endpoint: '/api/content/mortgage-refi/mortgage_refinance_bank/options',
    contentType: 'mortgage-refi'
  },
  {
    name: 'Credit Dropdown Options',
    endpoint: '/api/content/credit/credit_main_income_source/options',
    contentType: 'credit'
  },
  {
    name: 'Credit-Refi Dropdown Options',
    endpoint: '/api/content/credit-refi/refinance_credit_bank/options',
    contentType: 'credit-refi'
  }
];

async function testEndpoint(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`   Endpoint: ${config.endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE}${config.endpoint}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      const optionCount = data.data ? data.data.length : 0;
      console.log(`   ✅ SUCCESS: ${optionCount} options returned`);
      
      if (optionCount > 0) {
        console.log(`   📋 Sample option:`);
        const sample = data.data[0];
        console.log(`      RU: ${sample.ru || sample.titleRu || 'N/A'}`);
        console.log(`      HE: ${sample.he || sample.titleHe || 'N/A'}`);
      } else {
        console.log(`   ⚠️  No options found (empty array returned)`);
      }
    } else {
      console.log(`   ❌ FAILED: ${response.status} - ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('========================================');
  console.log('🧪 Testing All Dropdown Options Endpoints');
  console.log('========================================');
  
  for (const config of TEST_CONFIGS) {
    await testEndpoint(config);
  }
  
  console.log('\n========================================');
  console.log('✅ All tests completed');
  console.log('========================================');
}

// Run tests
runTests().catch(console.error);