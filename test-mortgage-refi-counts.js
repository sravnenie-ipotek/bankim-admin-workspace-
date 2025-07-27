#!/usr/bin/env node

// This script tests the mortgage-refi action counts issue
// Run with: node test-mortgage-refi-counts.js

import http from 'http';

// Test API endpoints
const BASE_URL = 'http://localhost:3001';

// Function to make HTTP request
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n📡 Requesting: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testMortgageRefiCounts() {
  try {
    console.log('🔍 Testing Mortgage-Refi Action Counts\n');
    console.log('='*50);
    
    // 1. Get list view data
    console.log('\n1️⃣ FETCHING LIST VIEW DATA...');
    const listData = await makeRequest('/api/content/mortgage-refi');
    
    if (!listData.success) {
      console.error('❌ Failed to fetch list data:', listData.error);
      return;
    }
    
    console.log('\n📊 List View Results:');
    console.log('Total screens:', listData.data.mortgage_content.length);
    console.log('\nScreen Summaries:');
    listData.data.mortgage_content.forEach(item => {
      console.log(`- ${item.screen_location}: ${item.actionCount} actions (${item.translations.ru})`);
    });
    
    // 2. Test each drill endpoint
    console.log('\n\n2️⃣ TESTING DRILL ENDPOINTS...');
    
    for (const item of listData.data.mortgage_content) {
      const screenLocation = item.screen_location;
      console.log(`\n\n📍 Testing drill for: ${screenLocation}`);
      console.log('-'.repeat(40));
      
      const drillData = await makeRequest(`/api/content/mortgage-refi/drill/${screenLocation}`);
      
      if (!drillData.success) {
        console.error(`❌ Failed to fetch drill data for ${screenLocation}:`, drillData.error);
        continue;
      }
      
      const drillCount = drillData.data.actionCount;
      const listCount = parseInt(item.actionCount);
      
      console.log(`List view count: ${listCount}`);
      console.log(`Drill view count: ${drillCount}`);
      console.log(`Match: ${listCount === drillCount ? '✅ YES' : '❌ NO'}`);
      
      if (listCount !== drillCount) {
        console.log(`\n⚠️  MISMATCH FOUND!`);
        console.log(`Expected: ${listCount}, Got: ${drillCount}`);
        console.log(`\nDrill view items:`);
        drillData.data.actions.forEach((action, idx) => {
          console.log(`  ${idx + 1}. ${action.content_key} (${action.component_type})`);
        });
      }
    }
    
    // 3. Direct SQL query simulation
    console.log('\n\n3️⃣ SQL QUERY ANALYSIS...');
    console.log('\nList view query groups by screen_location and counts all active items.');
    console.log('Drill view query filters by specific screen_location and counts individual items.');
    console.log('\nThe WHERE clauses should match:');
    console.log('- List: WHERE ci.screen_location IN (...) AND ci.is_active = TRUE');
    console.log('- Drill: WHERE ci.screen_location = $1 AND ci.is_active = true');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test
testMortgageRefiCounts();