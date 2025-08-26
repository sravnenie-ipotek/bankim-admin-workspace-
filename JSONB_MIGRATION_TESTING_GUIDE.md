# 🧪 JSONB Migration Testing Guide

## ✅ SAFE TESTING - NO DATABASE MODIFICATIONS

This implementation includes **complete shadow testing** that runs alongside your existing code **without modifying any database data** until you explicitly enable it.

---

## 📁 Files Created for Testing

1. **`packages/client/src/services/apiV2.ts`**
   - Shadow API service for new JSONB endpoint
   - Runs in test mode by default (no DB writes)

2. **`packages/client/src/components/JSONBDropdownEdit/JSONBDropdownEditV2.tsx`**
   - Enhanced dropdown editor with shadow testing panel
   - Shows real-time test results

3. **`packages/client/src/tests/jsonb-migration-test.ts`**
   - Automated test suite
   - Validates data transformation without DB access

4. **`packages/client/src/utils/migration-control.ts`**
   - Central control for migration modes
   - Safety switches to prevent accidental DB writes

---

## 🚀 How to Test Safely

### Step 1: Open Browser Console

Navigate to your admin panel and open browser DevTools console (F12).

### Step 2: Check Migration Status

```javascript
// In browser console
migrationControl.getMigrationStatus()
```

You should see:
```
Current Mode:     TEST
Dry Run:          ✅ (No DB writes)
Block Production: ✅
```

### Step 3: Run Automated Tests

```javascript
// In browser console
runMigrationTests()
```

This will:
- Test data transformation logic
- Validate JSONB structure
- Simulate API calls (no actual network requests)
- Show test results

Expected output:
```
╔═══════════════════════════════════════════════════════════╗
║         JSONB MIGRATION TEST SUITE                       ║
║         No Database Modifications Will Occur             ║
╚═══════════════════════════════════════════════════════════╝

🧪 TEST 1: Data Transformation
─────────────────────────────
✅ Data transformation tests passed

🧪 TEST 2: JSONB Structure Validation
─────────────────────────────────────
✅ Validation tests passed

... more tests ...

Success Rate: 100%
🎉 All tests passed! Ready for production migration.
```

### Step 4: Test with UI (Shadow Mode)

#### Option A: Use the V2 Component (Recommended)

1. Temporarily update your route to use V2 component:

```typescript
// In packages/client/src/App.tsx
// Find the route for JSONBDropdownEdit and change:
import JSONBDropdownEditV2 from './components/JSONBDropdownEdit/JSONBDropdownEditV2';

// Change route:
<Route path="/dropdown-edit/:actionId" element={<JSONBDropdownEditV2 />} />
```

2. Navigate to any dropdown edit page
3. You'll see the **Shadow Testing Control Panel** at the top
4. Make sure these are checked:
   - ✅ Enable Shadow Testing
   - ✅ Dry Run (No DB writes)  
   - ✅ Block Production Save

5. Edit some dropdown values and click Save
6. Watch the console for test results - **NO database changes will occur**

#### Option B: Test API Service Directly

```javascript
// In browser console
import apiV2Service from './services/apiV2';

// Test transformation and validation
await apiV2Service.updateContent(
  'test_dropdown',
  'test_screen',
  {
    titleRu: 'Тест',
    titleHe: 'טסט',
    options: [
      { ru: 'Опция 1', he: 'אפשרות 1' },
      { ru: 'Опция 2', he: 'אפשרות 2' }
    ]
  },
  'dropdown'
);
```

Console will show:
```
═══════════════════════════════════════════
🧪 [SHADOW TEST] Starting update operation
═══════════════════════════════════════════
🏃 [SHADOW] DRY RUN MODE - Simulating API response
✅ [SHADOW TEST] Operation completed successfully
```

---

## 🔄 Testing Phases

### Phase 1: Test Mode (Current) ✅
- **Status**: ACTIVE
- **Database Writes**: NONE
- **Purpose**: Validate transformation logic
- **Risk**: ZERO

### Phase 2: Parallel Mode (When Ready)
```javascript
// Enable parallel mode (writes to BOTH old and new systems)
migrationControl.confirmParallelMode()
```
- **Database Writes**: Both systems
- **Purpose**: Ensure both APIs work
- **Risk**: LOW (old system still primary)

### Phase 3: Production Mode (Final)
```javascript
// Switch to new API only
migrationControl.confirmProductionMode()
```
- **Database Writes**: New system only
- **Purpose**: Full migration
- **Risk**: MEDIUM (ensure BankIM ready)

---

## ✅ Verification Checklist

Before proceeding to production:

- [ ] All automated tests pass (100% success rate)
- [ ] Shadow testing shows correct data transformation
- [ ] Test results logged in console match expectations
- [ ] No database modifications occurred during testing
- [ ] BankIM team confirmed their new endpoint is ready
- [ ] Backup of current configuration exists

---

## 🛡️ Safety Features

1. **Default Test Mode**: System starts in test mode, no DB writes
2. **Explicit Confirmation**: Production mode requires explicit confirmation
3. **Dry Run Flag**: Prevents any API calls when enabled
4. **Block Production**: Additional safety to prevent saves
5. **Rollback Capability**: Can revert to previous configuration

---

## 📊 Monitoring Test Results

The shadow testing panel shows:
- Old API success/failure
- New API success/failure  
- Data structure validation
- Transformation errors

Example test result in UI:
```
Time: 10:23:45
Old API: ✅ (dry run)
New API: ✅
Data Match: ✅
```

---

## 🚨 Important Notes

1. **NO DATABASE CHANGES** will occur in test mode
2. **Shadow tests** run alongside normal operations
3. **Console logs** show all operations for transparency
4. **Test mode** is enforced by default for safety
5. **Production switch** requires multiple confirmations

---

## 📞 When to Contact BankIM

Contact BankIM team when:
1. All tests pass in test mode ✅
2. Ready to test with real endpoint
3. Need to verify their `/api/v2/content/unified` endpoint
4. Ready for parallel mode testing

---

## 🎯 Next Steps

1. **Now**: Run automated tests (`runMigrationTests()`)
2. **Next**: Test with UI in shadow mode
3. **Then**: Review test results with team
4. **Finally**: Coordinate with BankIM for endpoint testing

---

## 💡 Quick Commands Reference

```javascript
// Check current status
migrationControl.getMigrationStatus()

// Run automated tests
runMigrationTests()

// Enable test mode (safe)
migrationControl.enableTestMode()

// View test configuration
apiV2Service.getTestMode()

// Clear test results
apiV2Service.clearTestResults()
```

---

## ✅ Success Criteria

You know testing is successful when:
1. Console shows "All tests passed! Ready for production migration"
2. Shadow tests complete without errors
3. Data transformation matches BankIM's expected format
4. No database modifications occurred
5. Team confident in migration approach

---

**Remember**: The entire testing infrastructure is designed to be **100% safe**. No database changes will occur until you explicitly enable production mode with multiple confirmations.