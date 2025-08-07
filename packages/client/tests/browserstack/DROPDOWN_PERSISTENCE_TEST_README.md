# Calculator Formula Dropdown Persistence Test

This test specifically validates the dropdown functionality and value persistence on the Calculator Formula page (`http://localhost:4002/calculator-formula`).

## What This Test Does

1. **Navigates** to Calculator Formula page (http://localhost:4002/calculator-formula)
2. **Finds the bank selection dropdown** and verifies it has multiple values
3. **Records the original selected value**
4. **Changes the dropdown to a different value**
5. **Refreshes the page** to test if the value persists
6. **If value persisted**: Reverts back to the original value
7. **Reports results** with detailed logging

## Prerequisites

1. **BankIM Management Portal** must be running on `http://localhost:4002`
2. **BrowserStack account** with credentials configured
3. **Node.js** (version 16 or higher)
4. **Dependencies** installed: `npm install`

## BrowserStack Configuration

The test uses these credentials (from instructions.md):
- Username: `qabankimonline@gmail.com`
- Access Key: `1sPgh89g81AybDayLQtz`

## Running the Test

### Quick Run
```bash
# From the browserstack tests directory
npm run test:dropdown-persistence
```

### Direct Run
```bash
node calculator-formula-dropdown-persistence-test.js
```

### With Debug Output
```bash
DEBUG=1 node calculator-formula-dropdown-persistence-test.js
```

## Expected Behavior

### Bank Selection Dropdown
The test targets the bank selection dropdown with class `bank-dropdown` as defined in the `CalculatorFormula.tsx` component:

```tsx
<select 
  className="bank-dropdown"
  value={selectedBankId || ''}
  onChange={(e) => handleBankSelection(parseInt(e.target.value))}
  disabled={isLoading || isEditMode}
>
  <option value="">{t('calculator.selectBankOption')}</option>
  {banks.map(bank => (
    <option key={bank.id} value={bank.id}>
      {bank.name_ru} ({bank.name_en})
    </option>
  ))}
</select>
```

### Persistence Testing
The test will determine if the bank selection persists after page refresh. This tests:
- **Client-side state management** (React useState)
- **URL parameters** or **localStorage** persistence
- **Server-side session** state

## Test Results Interpretation

### ✅ SUCCESS: Value Persisted
If the dropdown value persists after refresh, it means the application has implemented one of:
- URL parameter tracking (`?bank=123`)
- localStorage/sessionStorage
- Server-side session state
- Cookie-based state management

### ℹ️ Value Did Not Persist
If the value doesn't persist, this may be **expected behavior** for security reasons in banking applications, where:
- Form state resets on refresh for security
- User must re-select sensitive parameters
- Clean state prevents accidental operations

## Output Example

```
🚀 Starting Calculator Formula Dropdown Persistence Test
=========================================================

🚀 Initializing BrowserStack WebDriver...
✅ WebDriver initialized successfully
🎯 Navigating to: http://localhost:4002/calculator-formula
✅ Successfully navigated to Calculator Formula page
🔍 Looking for bank dropdown...
✅ Found dropdown using CSS selector
📊 Found dropdown with 4 options:
  Option 0: "Select Bank" (value: "")
  Option 1: "Банк Апоалим (Bank Hapoalim)" (value: "1")
  Option 2: "Банк Леуми (Bank Leumi)" (value: "2")
  Option 3: "Дисконт Банк (Discount Bank)" (value: "3")
📌 Original selected value: "" ("Select Bank")
🔄 Changing dropdown value...
🎯 Selecting option: "Банк Апоалим (Bank Hapoalim)" (value: "1")
✅ Successfully changed dropdown value
🔄 Refreshing page to test value persistence...
🔍 Value after refresh: "1" ("Банк Апоалим (Bank Hapoalim)")
✅ SUCCESS: Value persisted after refresh!
🔄 Reverting to original value...
✅ Successfully reverted to original value: "" ("Select Bank")

🎉 Test execution completed!
📊 Test Summary
================
Navigation to Calculator Formula page: ✅ PASSED
Dropdown found and analyzed: ✅ PASSED
Dropdown value changed: ✅ PASSED
Persistence test executed: ✅ PASSED
Value persisted after refresh: ✅ YES
Value reverted (if needed): ✅ PASSED

Overall: 6/6 steps completed successfully

🎉 IMPORTANT FINDING: Dropdown values DO persist after page refresh!
```

## Troubleshooting

### Test Fails to Find Dropdown
- Ensure the Calculator Formula page is loading correctly
- Check if the component structure has changed
- Verify bank data is being loaded from the API

### BrowserStack Connection Issues
- Verify credentials in the test file
- Check if BrowserStack Local is running (for localhost testing)
- Ensure your BrowserStack plan supports local testing

### Page Load Issues
- Confirm the BankIM portal is running on localhost:4002
- Check browser console for JavaScript errors
- Verify database connection for bank data loading

## Test Architecture

The test is built using:
- **Selenium WebDriver 4.15.0** for browser automation
- **BrowserStack Hub** for cloud browser testing
- **BrowserStack Local** for localhost access
- **Smart element location** with multiple fallback strategies
- **Comprehensive error handling** and cleanup

## Integration with Existing Tests

This test complements the existing comprehensive test suite in `calculator-formula.test.js` by providing a focused, single-purpose validation of dropdown persistence functionality.