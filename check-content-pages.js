#!/usr/bin/env node

/**
 * Script to check all content pages for errors
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:4002';

// List of content endpoints to check
const contentEndpoints = [
  // Main content pages
  '/api/content/main/ru',
  '/api/content/main/he',
  '/api/content/main/en',
  
  // Mortgage pages
  '/api/content/mortgage/ru',
  '/api/content/mortgage/drill/mortgage_step1',
  '/api/content/mortgage/drill/mortgage_step2',
  '/api/content/mortgage/drill/mortgage_step3',
  '/api/content/mortgage/drill/mortgage_step4',
  '/api/content/mortgage/all-items',
  
  // Menu content
  '/api/content/menu/ru',
  
  // Credit content
  '/api/content/credit/ru',
  '/api/content/credit-refi/ru',
  
  // Mortgage refi
  '/api/content/mortgage-refi/ru',
  
  // UI settings
  '/api/ui-settings'
];

// Frontend pages to check
const frontendPages = [
  '/content',
  '/content/main',
  '/content/mortgage',
  '/content/menu',
  '/content/credit',
  '/content/credit-refi',
  '/content/mortgage-refi',
  '/content/mortgage/drill/mortgage_step1',
  '/content/mortgage/drill/mortgage_step2',
  '/content/mortgage/drill/mortgage_step3',
  '/content/mortgage/drill/mortgage_step4'
];

async function checkEndpoint(url) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      return { url, status: response.status, error: `HTTP ${response.status}` };
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!data.success && data.error) {
        return { url, status: response.status, error: data.error };
      }
      return { url, status: response.status, success: true };
    } else if (contentType && contentType.includes('text/html')) {
      // For frontend pages, just check if they return HTML
      return { url, status: response.status, success: true, type: 'html' };
    } else {
      return { url, status: response.status, error: `Unexpected content-type: ${contentType}` };
    }
  } catch (error) {
    return { url, error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking API endpoints...\n');
  
  // Check API endpoints
  for (const endpoint of contentEndpoints) {
    const result = await checkEndpoint(BASE_URL + endpoint);
    if (result.success) {
      console.log(`✅ ${result.url} - OK`);
    } else {
      console.log(`❌ ${result.url} - ${result.error}`);
    }
  }
  
  console.log('\n🔍 Checking frontend pages...\n');
  
  // Check frontend pages
  for (const page of frontendPages) {
    const result = await checkEndpoint(FRONTEND_URL + page);
    if (result.success) {
      console.log(`✅ ${result.url} - OK`);
    } else {
      console.log(`❌ ${result.url} - ${result.error}`);
    }
  }
}

main().catch(console.error);