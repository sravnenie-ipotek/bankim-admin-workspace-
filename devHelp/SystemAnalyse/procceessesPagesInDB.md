# Database Screen Location Conventions

## Overview
This document defines the standardized screen location naming conventions used in the content management system database for all mortgage and credit processes.

## 🚨 CRITICAL: NO MOCK DATA ALLOWED

### ⚠️ IMPORTANT WARNING
**DO NOT USE MOCK DATA** in production or development environments. All examples in this document are for illustration purposes only and should be replaced with real database content.

### Real Data Requirements
- **All screen locations MUST have real content** in the database
- **All translations MUST be complete** (RU/HE/EN for all content items)
- **All API endpoints MUST return real data** from PostgreSQL database
- **No hardcoded responses** or test data in production code

### Examples Are For Reference Only
The code examples in this document show the correct structure and patterns, but you must:
1. **Replace example values** with real database content
2. **Ensure all screen locations exist** in the database
3. **Verify all translations are complete** before deployment
4. **Test with real data** before going live

### Common Mistakes to Avoid
- ❌ **Hardcoded responses**: `res.json({test: 123, time: new Date()})`
- ❌ **Mock data arrays**: `[{id: 1, title: "Test"}]`
- ❌ **Empty responses**: `res.json({success: true, data: []})`
- ❌ **Placeholder content**: Using "Lorem ipsum" or dummy text
- ✅ **Real database queries**: Always query PostgreSQL for actual content
- ✅ **Complete translations**: Ensure RU/HE/EN for all content
- ✅ **Proper error handling**: Return meaningful errors when data is missing

## ⚠️ CRITICAL: Screen Location Requirements

### Exact Matching Rule
The `screen_location` field in the database **MUST EXACTLY MATCH** what the frontend code uses in API calls:

- **Case Sensitive**: `mortgage_step1` ≠ `Mortgage_Step1` ≠ `MORTGAGE_STEP1`
- **No Variations**: `mortgage_calculation` ≠ `calculate_mortgage_1` 
- **Exact String Match**: Even small differences will cause content to NOT load

### Frontend Dependency
**ALWAYS** verify the React component code to see what `screen_location` is being used:

```typescript
// ✅ CORRECT - Frontend API calls use 'mortgage_step1'
// Using apiService for content fetching:
const response = await apiService.getContentByType('mortgage/mortgage_step1/ru');
// Database MUST have: screen_location = 'mortgage_step1'

// For content type queries:
const response = await apiService.getContentByContentType('mortgage');
// Returns all mortgage content with their screen_location values

// ❌ WRONG - Mismatch causes content not to load
// Frontend API call: '/api/content/mortgage/mortgage_step1/ru'
// Database: screen_location = 'mortgage_calculation'  // NO MATCH!
```

### Verification Steps
1. **Check Frontend Code**: Search for `apiService` calls in React components to see what screen_location values are used
2. **Match Exactly**: Ensure database `screen_location` matches the API path parameter exactly
3. **Test API**: Verify `/api/content/{content_type}/{screen_location}/{language}` returns **REAL DATA** (not mock/test data)
4. **Update Documentation**: Document any new screen_location values used
5. **Verify Database Content**: Ensure all screen locations have actual content in the database
6. **Check Translations**: Verify all content has complete RU/HE/EN translations

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

## Shared Functional Pages

### Authentication Flow
- **Phone Verification**: `phone_verification`
- **SMS Code Verification**: `phone_code_verification`
- **Register by Phone**: `register_phone`
- **Register by Email**: `register_email`
- **Login Form**: `login_form`
- **Login by Email**: `login_email`
- **Login SMS Confirmation**: `login_sms_confirm`

### Password Reset Flow
- **Reset Password**: `reset_pwd`
- **Reset Password SMS**: `reset_pwd_sms`
- **Reset Password SMS Check**: `reset_pwd_sms_check`
- **Reset Password New**: `reset_pwd_new`
- **Reset Password Done**: `reset_pwd_done`
- **Reset Password Email**: `reset_pwd_email`

### Loading and Error Pages
- **Loading Screen**: `loading_screen`
- **Error 404**: `error_404`

### Legal and Policy Pages
- **Privacy Policy**: `privacy_policy`
- **Terms of Use**: `terms_of_use`

### Navigation Components
- **Sidebar Submenu**: `sidebar_submenu`

### Partner and Co-borrower Flows
- **Partner Personal Data**: `partner_personal_data`
- **Partner Income Data**: `partner_income_data`
- **Co-borrower Personal**: `co_borrower_personal`
- **Co-borrower Income**: `co_borrower_income`

### Additional Income and Debt Management
- **Additional Income Source**: `additional_income_source`
- **Extra Income Source**: `extra_income_source`
- **Debt Obligations**: `debt_obligations`

### Bank Detail Pages
- **Bank Details Description**: `bank_details_description`
- **Bank Details Conditions**: `bank_details_conditions`

### Personal Cabinet Pages
- **Cabinet Dashboard**: `cabinet_dashboard`
- **Cabinet Documents**: `cabinet_docs`
- **Cabinet Document Upload**: `cabinet_doc_upload`
- **Cabinet Loan Contract**: `cabinet_loan_contract`
- **Cabinet Application Accepted**: `cabinet_app_accepted`
- **Cabinet Final Programs**: `cabinet_final_programs`
- **Cabinet Bank Description**: `cabinet_bank_desc`
- **Cabinet Bank Conditions**: `cabinet_bank_cond`
- **Cabinet Edit Conditions**: `cabinet_edit_conditions`
- **Cabinet Offer**: `cabinet_offer`
- **Cabinet Payment**: `cabinet_payment`
- **Cabinet Payment Confirmation**: `cabinet_payment_ok`
- **Cabinet Bank Confirmation**: `cabinet_bank_confirm`
- **Cabinet Set Meeting**: `cabinet_set_meeting`
- **Cabinet Meeting Confirmation**: `cabinet_meeting_ok`
- **Cabinet Logout**: `cabinet_logout`
- **Cabinet Remaining Personal**: `cabinet_remaining_personal`
- **Cabinet Remaining Personal Co-borrower**: `cabinet_remaining_personal_co`
- **Cabinet Remaining Income**: `cabinet_remaining_income`
- **Cabinet Remaining Income Co-borrower**: `cabinet_remaining_income_co`

### Payment Pages
- **Payments Main**: `payments_main`
- **Payment History**: `payments_history`
- **Add Card**: `payments_add_card`
- **Delete Card**: `payments_del_card`

### Personal Data Management
- **Personal Data Main**: `personal_data_main`
- **Personal Data All Fields**: `personal_data_all`
- **Personal Data Income**: `personal_data_income`
- **Personal Data All Co-borrower**: `personal_data_all_co`
- **Personal Data Income Co-borrower**: `personal_data_income_co`

### My Services Pages
- **My Services Main**: `my_services_main`
- **My Services Mortgage**: `my_services_mortgage`
- **My Services Mortgage Refinance**: `my_services_mortgage_refi`
- **My Services Credit**: `my_services_credit`
- **My Services Credit Refinance**: `my_services_credit_refi`
- **My Services Use Co-borrower**: `my_services_use_co`

### Settings Pages
- **Settings Main**: `settings_main`
- **Settings Change Name**: `settings_change_name`
- **Settings Upload Avatar**: `settings_upload_avatar`
- **Settings Change Password**: `settings_change_pwd`
- **Settings Change Phone**: `settings_change_phone`
- **Settings Phone Verify**: `settings_phone_verify`
- **Settings Change Email**: `settings_change_email`
- **Settings Email Verify**: `settings_email_verify`
- **Settings Add Email**: `settings_add_email`
- **Settings Email Validation**: `settings_email_validation`

### Co-borrower Management
- **Add Co-borrowers Main**: `add_co_borrowers_main`
- **Add Co-borrowers Income**: `add_co_borrowers_income`

### Communication
- **Chat Messenger**: `chat_messenger`
- **Notification Page**: `notification_page`

### Special Credit Variations
- **Credit Renovation**: `credit_renovation`
- **Credit Deletion Confirmation**: `credit_deletion_confirmation`

### Mortgage Variations
- **Mortgage Reduction**: `mortgage_reduction`
- **Mortgage Increase**: `mortgage_increase`

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
- ✅ `mortgage_step1` - Fully migrated (61 items)
- ✅ `mortgage_step2` - Fully migrated (101 items)
- ✅ `mortgage_step3` - Fully migrated (82 items)
- ✅ `mortgage_step4` - Fully migrated (26 items)
- ✅ `credit_step1` - Fully migrated (19 items)
- ✅ `credit_step2` - Fully migrated (26 items)
- ✅ `credit_step3` - Fully migrated (22 items)
- ❌ `credit_step4` - Not migrated (0 items)
- ✅ `refinance_mortgage_step1` - Fully migrated (19 items)
- ✅ `refinance_mortgage_step2` - Fully migrated (26 items)
- ✅ `refinance_mortgage_step3` - Fully migrated (22 items)
- ✅ `refinance_credit_step1` - Fully migrated (19 items)
- ✅ `refinance_credit_step2` - Fully migrated (26 items)
- ✅ `refinance_credit_step3` - Fully migrated (22 items)
- ❌ `refinance_credit_step4` - Not migrated (0 items)

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
1. **Container**: `component_type = 'dropdown_container'`
   - Content key pattern: `{screen_location}.field.{field_name}`
   - Example: `mortgage_step2.field.education`

2. **Options**: `component_type = 'dropdown_option'`
   - Content key pattern: `{screen_location}.field.{field_name}_{descriptive_value}`
   - Uses descriptive naming for better maintainability
   - Examples: `mortgage_step2.field.education_bachelors`, `mortgage_step2.field.education_masters`

#### Descriptive Option Naming
The database uses descriptive option names rather than numbered patterns for better code maintainability:

**Education Field Examples:**
- `mortgage_step2.field.education_no_high_school_diploma`
- `mortgage_step2.field.education_partial_high_school_diploma` 
- `mortgage_step2.field.education_full_high_school_diploma`
- `mortgage_step2.field.education_bachelors`
- `mortgage_step2.field.education_masters`
- `mortgage_step2.field.education_doctorate`

**Additional Income Examples:**
- `mortgage_step3.field.additional_income_additional_salary`
- `mortgage_step3.field.additional_income_property_rental_income`
- `mortgage_step3.field.additional_income_0_no_additional_income`

#### Database Query Example
```sql
-- Get all education dropdown data for mortgage step 2
SELECT ci.content_key, ci.component_type, ct.content_value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'mortgage_step2' 
  AND ci.content_key LIKE '%education%'
  AND ct.language_code = 'en'
ORDER BY ci.component_type, ci.content_key;
```

---
