# Cypress Tests for Mortgage Content Navigation

This directory contains Cypress tests to check for errors when navigating through mortgage content pages and their drill-down levels.

## Prerequisites

1. Install Cypress (if not already installed):
```bash
npm install --save-dev cypress @types/cypress
```

2. Make sure the application is running on http://localhost:3002:
```bash
npm run full-dev
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
1. Go to http://localhost:3002/content/mortgage
2. Click on any of the 4 pages (arrow buttons on the right)
3. In the drill page, click on any action item's arrow button
4. Check the browser console for errors
5. Check if the edit page loads correctly