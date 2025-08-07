# Cypress Tests for Mortgage Content Navigation

This directory contains Cypress tests to check for errors when navigating through mortgage content pages and their drill-down levels.

## Prerequisites

1. Install Cypress (if not already installed):
```bash
npm install --save-dev cypress @types/cypress
```

2. Make sure the application is running on http://localhost:4002:
```bash
npm run full-dev
```

## Installing Cypress

First, install Cypress and its dependencies:
```bash
npm install --save-dev cypress @types/cypress
```

## Running Tests

### Open Cypress Test Runner (Interactive Mode)
```bash
npm run cypress:open
```
Then select E2E Testing and choose a test to run.

### Run All Tests in Headless Mode
```bash
npm run test:all
```

### Run Specific Test Suites

#### Test all mortgage page navigation:
```bash
npm run test:mortgage
```

#### Test specifically for "Content item not found" errors:
```bash
npm run test:content-errors
```

#### Run FULL drill depth test (checks EVERY action to the bottom):
```bash
npm run test:full-drill
```
This test will:
- Navigate through ALL mortgage pages
- Click on EVERY action item in EVERY drill page
- Check ALL pagination pages (up to 10 pages per drill)
- Generate a comprehensive error report

#### Quick smoke test (tests first action of each page):
```bash
npx cypress run --spec 'cypress/e2e/quick-drill-check.cy.ts'
```

## Test Files

1. **mortgage-drill-navigation.cy.ts**
   - Navigates through all 4 mortgage pages (as shown in your screenshot)
   - Clicks on each drill-down action item
   - Checks for console errors and page errors
   - Tests pagination if available

2. **content-not-found-check.cy.ts**
   - Focused test for finding "Content item not found" errors
   - Specifically looks for ID: 1370 error
   - Creates a report of all problematic IDs
   - Tests both mortgage and mortgage-refi content

3. **full-drill-depth-test.cy.ts** (COMPREHENSIVE TEST)
   - Tests EVERY mortgage page
   - Clicks EVERY action item on EVERY drill page
   - Navigates through ALL pagination pages
   - Generates detailed error report with:
     - Page name
     - Action number
     - Action ID
     - Error type
     - URL where error occurred
   - Takes screenshots of all errors
   - Saves report to `cypress/reports/full-drill-test-report.txt`

4. **quick-drill-check.cy.ts**
   - Quick smoke test
   - Tests only the first action of each page
   - Validates API endpoints
   - Good for quick validation before running full tests

## Understanding Test Results

### Success
- All content items load without errors
- No "Content item not found" messages
- No console errors related to missing IDs

### Failure
- The test will fail if it finds any "Content item not found" errors
- Screenshots will be saved in `cypress/screenshots/`
- Videos will be saved in `cypress/videos/`
- Error reports will be saved in `cypress/reports/`

## Debugging Failed Tests

1. Check the console output for specific IDs that are failing
2. Look at screenshots in `cypress/screenshots/` for visual evidence
3. Check `cypress/reports/` for detailed error lists
4. Review the video recordings in `cypress/videos/`

## Common Issues

### "Content item not found. Looking for ID: 1370"
This error occurs when:
- The drill page shows an action with ID 1370
- But the API endpoint `/api/content/item/1370` returns 404 or the item doesn't exist
- The SharedContentEditForm tries to fetch this item but fails

### Fix Applied
The code has been updated to:
1. First try to fetch items by ID using the dedicated endpoint
2. Fall back to searching in a list if that fails
3. Use proper content type detection for mortgage vs mortgage-refi

## Manual Testing

To manually reproduce the issue:
1. Go to http://localhost:4002/content/mortgage
2. Click on any of the 4 pages (arrow buttons on the right)
3. In the drill page, click on any action item's arrow button
4. Check the browser console for errors
5. Check if the edit page loads correctly