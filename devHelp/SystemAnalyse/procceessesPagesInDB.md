# Database Screen Location Conventions

## Overview
This document defines the standardized screen location naming conventions used in the content management system database for all mortgage and credit processes.

## ⚠️ CRITICAL: Screen Location Requirements

### Exact Matching Rule
The `screen_location` field in the database **MUST EXACTLY MATCH** what the frontend code uses in `useContentApi()` calls:

- **Case Sensitive**: `mortgage_step1` ≠ `Mortgage_Step1` ≠ `MORTGAGE_STEP1`
- **No Variations**: `mortgage_calculation` ≠ `calculate_mortgage_1` 
- **Exact String Match**: Even small differences will cause content to NOT load

### Frontend Dependency
**ALWAYS** verify the React component code to see what `screen_location` is being used:

```typescript
// ✅ CORRECT - Frontend uses 'mortgage_step1'
const { getContent } = useContentApi('mortgage_step1')
// Database MUST have: screen_location = 'mortgage_step1'

// ❌ WRONG - Mismatch causes content not to load
// Frontend: useContentApi('mortgage_step1')
// Database: screen_location = 'mortgage_calculation'  // NO MATCH!
```

### Verification Steps
1. **Check Frontend Code**: Search for `useContentApi('...')` calls in React components
2. **Match Exactly**: Ensure database `screen_location` matches the parameter exactly
3. **Test API**: Verify `/api/content/{screen_location}/{language}` returns data
4. **Update Documentation**: Document any new screen_location values used

## Database Screen Location Mapping

### Refinance Mortgage Process
Database screen locations for refinance mortgage:

- **Step 1 (Calculator)**: `refinance_credit_1`
- **Step 2 (Personal Data)**: `refinance_credit_2` 
- **Step 3 (Income Data)**: `refinance_credit_3`
- **Step 4 (Program/Bank Selection)**: `mortgage_step4`

### Refinance Credit Process
Database screen locations for refinance credit:

- **Step 1 (Calculator)**: `refinance_credit_1`
- **Step 2 (Personal Data)**: `refinance_credit_2`
- **Step 3 (Income Data)**: `refinance_credit_3` 
- **Step 4 (Results/Summary)**: `refinance_credit_4`

### Calculate Mortgage Process
Database screen locations for mortgage calculation:

- **Step 1 (Calculator)**: `mortgage_step1`
- **Step 2 (Personal Data)**: `mortgage_step2`
- **Step 3 (Income Data)**: `mortgage_step3`
- **Step 4 (Program/Bank Selection)**: `mortgage_step4`

### Calculate Credit Process
Database screen locations for credit calculation:

- **Step 1 (Calculator)**: `credit_step1`
- **Step 2 (Personal Data)**: `credit_step2`
- **Step 3 (Income Data)**: `credit_step3`
- **Step 4 (Program/Bank Selection)**: `credit_step4`

## Other Database Screen Locations

### Sidebar Menu
- **Menu Items**: `sidebar`

### Footer
- **Footer Content**: `footer`

### Bank Components
- **Bank Offers Display**: `bank_offers`
- **Bank Comparison**: `bank_comparison`

### General Pages
- **Home Page**: `home_page`
- **About Page**: `about_page`
- **Contacts Page**: `contacts_page`

### Admin Panel
- **Admin Dashboard**: `admin_dashboard`
- **Content Management**: `admin_content`
- **User Management**: `admin_users`

## Database Rules

### Critical Conventions
- **Refinance Mortgage** MUST use `refinance_credit_*` screen locations in database
- **Calculate Mortgage** MUST use `mortgage_step*` screen locations in database
- **Calculate Credit** MUST use `credit_step*` screen locations in database
- **Refinance Credit** MUST use `refinance_credit_*` screen locations in database

### Language Support
All screen locations support three languages in `content_translations` table:
- `en` (English)
- `he` (Hebrew) 
- `ru` (Russian)

### Migration Status in Database
- ✅ `refinance_credit_1` - Content migrated to database
- ✅ `refinance_credit_2` - Content migrated to database
- ✅ `refinance_credit_3` - Content migrated to database
- ✅ `refinance_credit_4` - Content migrated to database
- ✅ `mortgage_step4` - Content migrated to database
- ⚠️ `mortgage_step1` - Partially migrated
- ⚠️ `mortgage_step2` - Partially migrated  
- ⚠️ `mortgage_step3` - Partially migrated
- ❌ `credit_step1` - Not migrated
- ❌ `credit_step2` - Not migrated
- ❌ `credit_step3` - Not migrated
- ❌ `credit_step4` - Not migrated

## Database Verification Queries

### Check Available Content by Screen Location
```sql
SELECT screen_location, COUNT(*) as content_items
FROM content_items 
WHERE screen_location IN (
    'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4',
    'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
    'credit_step1', 'credit_step2', 'credit_step3', 'credit_step4'
)
GROUP BY screen_location
ORDER BY screen_location;
```

### Check Translation Coverage in Database
```sql
SELECT 
    ci.screen_location,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'en' THEN ci.id END) as english_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'he' THEN ci.id END) as hebrew_items,
    COUNT(DISTINCT CASE WHEN ct.language_code = 'ru' THEN ci.id END) as russian_items
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE '%credit_%' OR ci.screen_location LIKE '%mortgage_%'
GROUP BY ci.screen_location
ORDER BY ci.screen_location;
```

### Find All Screen Locations in Database
```sql
SELECT DISTINCT screen_location, COUNT(*) as items
FROM content_items 
GROUP BY screen_location 
ORDER BY screen_location;
```

## Database Tables Structure

### Primary Tables
- **content_items**: Contains screen_location, content_key, component_type, category
- **content_translations**: Contains language-specific content values linked to content_items

### Key Database Fields
- **screen_location**: Process identifier (e.g., 'refinance_credit_1')
- **content_key**: Unique content identifier within screen location
- **language_code**: Language identifier ('en', 'he', 'ru')
- **content_value**: Actual translated text content

## Dropdown Database Convention

### Dropdown Component Structure
All dropdown fields consist of multiple related database entries grouped by `screen_location`:

#### Component Types:
1. **Field Label**: `component_type = 'field_label'`
   - Content key pattern: `{process}_{field_name}`
   - Example: `calculate_credit_education`

2. **Placeholder**: `component_type = 'placeholder'`
   - Content key pattern: `{process}_{field_name}_ph`
   - Example: `calculate_credit_education_ph`

3. **Options**: `component_type = 'option'`
   - Content key pattern: `{process}_{field_name}_option_{number}`
   - Sequential numbering: `_option_1`, `_option_2`, `_option_3`, etc.
   - Examples: `calculate_credit_education_option_1`, `calculate_credit_education_option_2`

#### Step Association
All dropdown components for the same field share the same `screen_location`:

**Example - Education Dropdown in Credit Step 2:**
```
screen_location: 'calculate_credit_2'
- calculate_credit_education (field_label)
- calculate_credit_education_ph (placeholder)  
- calculate_credit_education_option_1 (option)
- calculate_credit_education_option_2 (option)
- calculate_credit_education_option_3 (option)
```

#### Database Query Example
```sql
-- Get all education dropdown components for credit step 2
SELECT content_key, component_type, category
FROM content_items 
WHERE screen_location = 'calculate_credit_2' 
  AND content_key LIKE 'calculate_credit_education%'
ORDER BY component_type, content_key;
```

#### Frontend Integration
Components use `useContentApi('screen_location')` to fetch all content for a step, then filter by content_key patterns to group dropdown components together.
