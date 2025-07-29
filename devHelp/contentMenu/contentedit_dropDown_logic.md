# Dropdown Logic Fix Instructions - Bulletproof Guide

## Overview
This guide provides step-by-step instructions to fix dropdown functionality across ALL content menus (mortgage, credit, menu, general, etc.). The fixes ensure proper navigation, option display, and accurate counting.

## Problem Summary
- Dropdown headers were navigating to text edit instead of dropdown edit pages
- Dropdown options were showing in drill pages (should be hidden)
- Dropdown options were not showing in dropdown edit pages
- Action counts included dropdown options (should exclude them)
- Inconsistent component type handling (`option` vs `dropdown_option`)

## Complete Fix Process

### Step 1: Backend - Exclude Options from Count Queries

#### 1.1 Find All Content List Queries
Search for all content list endpoints in `backend/server.js`:
```bash
grep -n "api/content" backend/server.js
```

#### 1.2 Update Each Query to Exclude Options
For each content type (mortgage, credit, menu, general, etc.), find the query and add exclusions:

**BEFORE:**
```sql
WHERE ci.screen_location IN ('mortgage_step1', 'mortgage_step2', ...)
  AND ci.is_active = TRUE
  AND ci.component_type != 'option'
```

**AFTER:**
```sql
WHERE ci.screen_location IN ('mortgage_step1', 'mortgage_step2', ...)
  AND ci.is_active = TRUE
  AND ci.component_type != 'option'
  AND ci.component_type != 'dropdown_option'
```

#### 1.3 Content Types to Fix
- ✅ Mortgage: `/api/content/mortgage` (already fixed)
- 🔄 Credit: `/api/content/credit`
- 🔄 Menu: `/api/content/menu`
- 🔄 General: `/api/content/general`
- 🔄 Credit-Refi: `/api/content/credit-refi`
- 🔄 Mortgage-Refi: `/api/content/mortgage-refi`

#### 1.4 Verification
After each fix, test the count:
```bash
curl -s "http://localhost:3001/api/content/{content-type}" | jq '.data.{content-type}_content[] | {id, actionCount}'
```

**Expected Result:** Count should decrease by the number of dropdown options.

### Step 2: Backend - Fix Dropdown Options API

#### 2.1 Find Dropdown Options Endpoints
Search for dropdown options endpoints:
```bash
grep -n "options.*GET" backend/server.js
```

#### 2.2 Update Component Type Filters
For each dropdown options endpoint, ensure it includes `dropdown_option`:

**BEFORE:**
```sql
WHERE ci.screen_location = 'mortgage_step1'
  AND (ci.component_type = 'option' OR ci.component_type = 'text')
  AND ci.content_key LIKE $1
```

**AFTER:**
```sql
WHERE ci.screen_location = 'mortgage_step1'
  AND (ci.component_type = 'option' OR ci.component_type = 'text' OR ci.component_type = 'dropdown_option')
  AND ci.content_key LIKE $1
```

#### 2.3 Endpoints to Fix
- ✅ Mortgage: `/api/content/mortgage/{contentKey}/options` (already fixed)
- 🔄 Credit: `/api/content/credit/{contentKey}/options`
- 🔄 Menu: `/api/content/menu/{contentKey}/options`
- 🔄 General: `/api/content/general/{contentKey}/options`
- 🔄 Credit-Refi: `/api/content/credit-refi/{contentKey}/options`
- 🔄 Mortgage-Refi: `/api/content/mortgage-refi/{contentKey}/options`

#### 2.4 Verification
Test each dropdown options endpoint:
```bash
# Find a dropdown content key first
curl -s "http://localhost:3001/api/content/{content-type}/drill/{step-id}" | jq '.data.actions[] | select(.component_type == "label") | {id, content_key}'

# Test the options endpoint
curl -s "http://localhost:3001/api/content/{content-type}/{content-key}/options" | jq '.data | length'
```

**Expected Result:** Should return dropdown options, not empty array.

### Step 3: Frontend - Fix Drill Page Filtering

#### 3.1 Find All Drill Components
Locate all drill components in `src/pages/`:
- `MortgageDrill.tsx` (already fixed)
- `MenuDrill.tsx`
- `CreditDrill.tsx`
- `GeneralDrill.tsx`
- etc.

#### 3.2 Update Visible Actions Filter
In each drill component, update the `visibleActions` filter:

**BEFORE:**
```typescript
const visibleActions = useMemo(() => {
  if (!drillData?.actions) return [];
  return drillData.actions.filter(action => {
    // Hide individual dropdown option values, only show dropdown headers
    if (action.component_type?.toLowerCase() === 'option') {
      return false;
    }
    return true;
  });
}, [drillData?.actions]);
```

**AFTER (Include Placeholders as TEXT):**
```typescript
const visibleActions = useMemo(() => {
  if (!drillData?.actions) return [];
  return drillData.actions.filter(action => {
    // Hide individual dropdown option values, only show dropdown headers
    if (action.component_type?.toLowerCase() === 'option' || 
        action.component_type?.toLowerCase() === 'dropdown_option') {
      return false;
    }
    // Include placeholder components as TEXT type
    return true;
  });
}, [drillData?.actions]);
```

#### 3.3 Update Navigation Logic
Fix the `handleEditClick` function to prioritize dropdown detection:

**BEFORE:**
```typescript
// For text types - navigate to the special text edit page
if (componentTypeLower === 'text' || 
    componentTypeLower === 'label' ||
    componentTypeLower === 'field_label' ||
    typeDisplay === 'Текст') {
  navigate(paths.textEditPath, { state: navigationState });
} 
// For dropdown types - navigate to the special dropdown edit page
else if (componentTypeLower === 'dropdown' || 
         componentTypeLower === 'select' ||
         componentTypeLower === 'option' ||
         typeDisplay === 'Дропдаун') {
  navigate(paths.dropdownEditPath, { state: navigationState });
}
```

**AFTER:**
```typescript
// For dropdown types - navigate to the special dropdown edit page (check typeDisplay first)
if (typeDisplay === 'Дропдаун') {
  console.log('📋 Navigating to dropdown edit page:', paths.dropdownEditPath);
  navigate(paths.dropdownEditPath, { state: navigationState });
} 
// For text types - navigate to the special text edit page
else if (componentTypeLower === 'text' || 
    componentTypeLower === 'label' ||
    componentTypeLower === 'field_label' ||
    typeDisplay === 'Текст') {
  console.log('✅ Navigating to text edit page:', paths.textEditPath);
  navigate(paths.textEditPath, { state: navigationState });
}
```

#### 3.4 Update getComponentTypeDisplay Function
Ensure the function correctly identifies dropdown fields and shows placeholders as TEXT:

```typescript
const getComponentTypeDisplay = (componentType: string, contentKey: string = '') => {
  // Check if this is a dropdown-related field based on content patterns
  const isDropdownField = contentKey.includes('_option') || 
                          contentKey.includes('citizenship') ||
                          contentKey.includes('education') ||
                          contentKey.includes('family_status') ||
                          contentKey.includes('main_source') ||
                          contentKey.includes('debt_types') ||
                          contentKey.includes('has_additional') ||
                          contentKey.includes('property_ownership') ||
                          contentKey.includes('first_home') ||
                          contentKey.includes('sphere') ||
                          contentKey.includes('type') ||
                          contentKey.includes('when_needed') ||
                          // Only include _ph if it's not a standalone placeholder
                          (contentKey.includes('_ph') && !contentKey.endsWith('_ph'));

  switch (componentType?.toLowerCase()) {
    case 'dropdown':
    case 'select':
      return 'Дропдаун';
    case 'option':
    case 'dropdown_option':
      return 'Дропдаун';
    case 'placeholder':
      return 'Текст';  // Always show placeholders as TEXT
    case 'label':
    case 'field_label':
      return isDropdownField ? 'Дропдаун' : 'Текст';
    // ... other cases
  }
};
```

### Step 4: Frontend - Add Missing Routes

#### 4.1 Check App.tsx Routes
Ensure all content types have proper edit routes in `src/App.tsx`:

```typescript
// Example for each content type
<Route
  path="/content/{content-type}/dropdown-edit/:actionId"
  element={
    <ErrorBoundary>
      <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-{content-type}">
        <SharedContentEdit />
      </AdminLayout>
    </ErrorBoundary>
  }
/>

<Route
  path="/content/{content-type}/text-edit/:actionId"
  element={
    <ErrorBoundary>
      <AdminLayout title="Редактирование текста" activeMenuItem="content-{content-type}">
        <SharedContentEdit />
      </AdminLayout>
    </ErrorBoundary>
  }
/>
```

#### 4.2 Content Types to Add Routes For
- ✅ Mortgage (already exists)
- 🔄 Credit
- 🔄 Menu
- 🔄 General
- 🔄 Credit-Refi
- 🔄 Mortgage-Refi

### Step 5: Testing and Verification

#### 5.1 Test Each Content Type
For each content type, verify:

1. **List Page Count:**
   ```bash
   curl -s "http://localhost:3001/api/content/{content-type}" | jq '.data.{content-type}_content[] | {actionCount}'
   ```

2. **Drill Page Navigation:**
   - Navigate to drill page
   - Click on dropdown header
   - Should go to dropdown edit page (not text edit)

3. **Dropdown Options Display:**
   ```bash
   curl -s "http://localhost:3001/api/content/{content-type}/{content-key}/options" | jq '.data | length'
   ```

4. **Drill Page Filtering:**
   - Drill page should NOT show individual dropdown options
   - Only dropdown headers should be visible
   - Placeholders should be visible as TEXT type

#### 5.2 Expected Results
- ✅ List page counts exclude dropdown options
- ✅ Drill pages hide dropdown options
- ✅ Drill pages show placeholders as TEXT type
- ✅ Dropdown headers navigate to dropdown edit pages
- ✅ Dropdown edit pages show all options
- ✅ Text items navigate to text edit pages
- ✅ Placeholders navigate to text edit pages

### Step 6: Restart and Deploy

#### 6.1 Restart Backend
```bash
pkill -f "node.*server.js" && sleep 2 && cd backend && node server.js
```

#### 6.2 Test Frontend
```bash
npm start
```

#### 6.3 Commit and Push
```bash
git add .
git commit -m "Fix dropdown logic across all content types

- Exclude dropdown options from count queries
- Fix dropdown options API to include dropdown_option type
- Update drill page filtering to hide options
- Fix navigation logic to prioritize dropdown detection
- Add missing routes for all content types"
git push
```

## Common Issues and Solutions

### Issue 1: Empty Dropdown Options
**Problem:** Dropdown edit page shows no options
**Solution:** Check if backend includes `dropdown_option` in component type filter

### Issue 2: Wrong Navigation
**Problem:** Dropdown headers go to text edit instead of dropdown edit
**Solution:** Ensure `typeDisplay === 'Дропдаун'` check comes BEFORE component type checks

### Issue 3: Options Show in Drill Page
**Problem:** Individual dropdown options visible in drill page
**Solution:** Add `dropdown_option` to the filter in `visibleActions`

### Issue 5: Placeholders Hidden in Drill Page
**Problem:** Placeholder components not visible in drill page
**Solution:** Remove placeholder filtering and show them as TEXT type

### Issue 4: Count Still Includes Options
**Problem:** List page count still includes dropdown options
**Solution:** Add `AND ci.component_type != 'dropdown_option'` to count query

## Verification Checklist

- [ ] Backend count queries exclude both `option` and `dropdown_option`
- [ ] Backend dropdown options API includes `dropdown_option` type
- [ ] Frontend drill pages filter out both `option` and `dropdown_option`
- [ ] Frontend drill pages show placeholders as TEXT type
- [ ] Frontend navigation prioritizes `typeDisplay === 'Дропдаун'`
- [ ] All content types have proper edit routes
- [ ] All dropdowns show options in edit pages
- [ ] All dropdown headers navigate to dropdown edit pages
- [ ] All text items navigate to text edit pages
- [ ] All placeholders navigate to text edit pages
- [ ] No individual options show in drill pages

## Example: Complete Fix for Credit Content

1. **Backend Count Query:**
   ```sql
   WHERE ci.screen_location IN ('credit_step1', 'credit_step2', ...)
     AND ci.is_active = TRUE
     AND ci.component_type != 'option'
     AND ci.component_type != 'dropdown_option'
   ```

2. **Backend Options API:**
   ```sql
   WHERE ci.screen_location = 'credit_step1'
     AND (ci.component_type = 'option' OR ci.component_type = 'text' OR ci.component_type = 'dropdown_option')
     AND ci.content_key LIKE $1
   ```

3. **Frontend Drill Filtering:**
   ```typescript
   if (action.component_type?.toLowerCase() === 'option' || 
       action.component_type?.toLowerCase() === 'dropdown_option') {
     return false;
   }
   // Include placeholder components as TEXT type
   return true;
   ```

4. **Frontend Navigation:**
   ```typescript
   if (typeDisplay === 'Дропдаун') {
     navigate(paths.dropdownEditPath, { state: navigationState });
   }
   ```

5. **Frontend Routes:**
   ```typescript
   <Route path="/content/credit/dropdown-edit/:actionId" element={<SharedContentEdit />} />
   <Route path="/content/credit/text-edit/:actionId" element={<SharedContentEdit />} />
   ```

## Important Note: Placeholder Handling

### Placeholder Components
- **List Page**: Placeholders are **included** in the count (they are content items)
- **Drill Page**: Placeholders are **visible** as TEXT type (not hidden)
- **Navigation**: Placeholders navigate to **text edit pages**
- **Display**: Placeholders show as "Текст" (TEXT) type

### Example Placeholders:
- "Выберите город" (Select city) - **TEXT**
- "Выберите тип обязательства" (Select obligation type) - **TEXT**
- "Введите имя и фамилию" (Enter first name and last name) - **TEXT**

This guide ensures consistent dropdown behavior across ALL content types in the system.
