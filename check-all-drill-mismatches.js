#!/usr/bin/env node

// This script checks for mismatches between list view counts and drill view counts
// across all content types (mortgage, mortgage-refi, credit, credit-refi)

import http from 'http';

const BASE_URL = 'http://localhost:3001';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`📡 Requesting: ${url}`);
    
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

async function checkContentType(contentType, listPath, contentField, drillBasePath) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 Checking ${contentType.toUpperCase()}`);
  console.log('='.repeat(60));
  
  try {
    // Get list data
    const listData = await makeRequest(listPath);
    if (!listData.success) {
      console.error(`❌ Failed to fetch ${contentType} list data:`, listData.error);
      return;
    }
    
    const items = listData.data[contentField];
    console.log(`\n📊 List View Summary:`);
    console.log(`Total items: ${items.length}`);
    
    // Test each drill endpoint
    for (const item of items) {
      const drillId = item.content_key || item.screen_location;
      console.log(`\n📍 ${drillId}: "${item.translations?.ru || item.description || drillId}"`);
      console.log('-'.repeat(50));
      
      try {
        const drillData = await makeRequest(`${drillBasePath}/${drillId}`);
        
        if (!drillData.success) {
          console.error(`❌ Drill request failed:`, drillData.error);
          continue;
        }
        
        const listCount = parseInt(item.actionCount || item.action_count || 0);
        const drillCount = drillData.data.actionCount;
        const drillActions = drillData.data.actions || [];
        
        // Count option items
        const optionCount = drillActions.filter(a => 
          a.component_type?.toLowerCase() === 'option'
        ).length;
        
        const visibleCount = drillActions.length - optionCount;
        
        console.log(`List view shows: ${listCount} actions`);
        console.log(`Drill API returns: ${drillCount} total actions`);
        console.log(`  - Regular items: ${visibleCount}`);
        console.log(`  - Option items: ${optionCount} (hidden in UI)`);
        console.log(`UI displays: ${visibleCount} (after filtering options)`);
        
        if (listCount !== drillCount) {
          console.log(`\n⚠️  MISMATCH: List (${listCount}) ≠ Drill (${drillCount})`);
        } else {
          console.log(`✅ Counts match in API`);
        }
        
        if (drillCount !== visibleCount) {
          console.log(`📌 UI shows ${visibleCount} instead of ${drillCount} due to option filtering`);
        }
        
      } catch (error) {
        console.error(`❌ Error fetching drill data:`, error.message);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error checking ${contentType}:`, error.message);
  }
}

async function runAllChecks() {
  console.log('🔍 Checking All Content Type Drill Mismatches\n');
  
  // Check mortgage
  await checkContentType(
    'mortgage',
    '/api/content/mortgage',
    'mortgage_content',
    '/api/content/mortgage/drill'
  );
  
  // Check mortgage-refi
  await checkContentType(
    'mortgage-refi',
    '/api/content/mortgage-refi',
    'mortgage_content',
    '/api/content/mortgage-refi/drill'
  );
  
  // Note: Credit and credit-refi don't have drill endpoints in the current implementation
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 CREDIT & CREDIT-REFI');
  console.log('='.repeat(60));
  console.log('Note: Credit and credit-refi content types do not have drill endpoints');
  console.log('They display all content in a flat list without drill-down functionality');
  
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(60));
  console.log('The mismatch occurs because:');
  console.log('1. Backend counts ALL items including "option" type components');
  console.log('2. Frontend filters out "option" components before display');
  console.log('3. The fix applied shows visibleActions.length to match pagination');
  console.log('\nThis ensures consistency between the displayed count and pagination.');
}

// Run the checks
runAllChecks();