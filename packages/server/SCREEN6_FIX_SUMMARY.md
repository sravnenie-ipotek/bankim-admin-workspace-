# Screen #6 Navigation Mapping Fix - Summary

## Issue Description
User reported that screen #6 "Анкета партнера. Доходы" (Partner Income Form) was showing wrong information at `http://localhost:4002/content/mortgage`. According to user research, this screen should map to the borrowers personal data page which appears after the mortgage calculator and phone verification, where users enter personal details like name, birthday, education, citizenship, etc.

## Root Cause Analysis

### Before Fix
- **Screen #6**: "Анкета партнера. Доходы" → `mortgage_step4`
- **Problem**: `mortgage_step4` contains mortgage results and program selection content, not personal data input
- **Expected Flow**: Calculator → Phone → **Personal Data** → Partner Personal → Partner Income
- **Actual Flow**: Calculator → Phone → Personal Data → Partner Personal → **Results Page** ❌

### Database Investigation
1. Checked `navigation_mapping` table for `confluence_num = '6'`
2. Found it was pointing to `mortgage_step4` (results/selection screen)
3. Analyzed content in `mortgage_step4`: Contains mortgage calculation results, bank selection, program filters
4. Verified `mortgage_step2`: Contains actual personal data fields (name, birth date, citizenship, education)

## Solution Implemented

### Navigation Mapping Update
```sql
UPDATE navigation_mapping 
SET 
    screen_location = 'borrowers_personal_data_step1',
    updated_at = CURRENT_TIMESTAMP
WHERE confluence_num = '6';
```

### Changes Made
- **Before**: Screen #6 → `mortgage_step4` (wrong page)
- **After**: Screen #6 → `borrowers_personal_data_step1` (correct flow)

## Verification Results

### ✅ Navigation Mapping Fixed
- Screen #6 now correctly points to `borrowers_personal_data_step1`
- API endpoint `/api/content/mortgage` returns updated mapping
- Database shows `updated_at` timestamp of fix

### ✅ API Response Updated
The `/api/content/mortgage` endpoint now returns:
```json
{
  "confluence_num": "6",
  "content_key": "borrowers_personal_data_step1", 
  "screen_location": "borrowers_personal_data_step1",
  "description": "Анкета партнера. Доходы",
  "actionCount": "0"
}
```

### ✅ Corrected Navigation Flow
```
2. Калькулятор ипотеки → mortgage_step1
3. Ввод номера телефона → mortgage_phone  
4. Анкета личных данных → mortgage_step2
5. Анкета партнера. Личные данные → mortgage_step3
6. Анкета партнера. Доходы → borrowers_personal_data_step1 🔧 [FIXED]
7. Анкета доходов. Наемный работник → mortgage_income_employee
```

## Files Created/Modified

### Scripts Created
1. **`scripts/check-navigation-mapping.js`** - Initial diagnosis script
2. **`scripts/find-personal-data-screens.js`** - Content analysis script
3. **`scripts/fix-navigation-mapping-screen6.js`** - Main fix implementation
4. **`scripts/verify-screen6-fix.js`** - Post-fix verification
5. **`scripts/screen6-navigation-fix.sql`** - SQL documentation with rollback

### Database Changes
- Modified `navigation_mapping` table
- Updated `confluence_num = '6'` mapping from `mortgage_step4` to `borrowers_personal_data_step1`

## Next Steps Required

### ⚠️ Content Creation Needed
Currently `borrowers_personal_data_step1` has **0 content items**. The following needs to be created:

#### Personal Data Fields Required
1. **Name Fields**
   - First name / Last name
   - Name validation and formatting

2. **Personal Information**
   - Date of birth / Birthday
   - Gender selection
   - Citizenship/nationality dropdown

3. **Education & Background**
   - Education level dropdown
   - Professional background

4. **Identification**
   - ID document type
   - Document number
   - Issue date

5. **Address Information**
   - Current address
   - Property ownership status

#### Content Item Creation Example
```sql
-- Example content items to create
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active) VALUES
('borrowers_personal_data.field.first_name', 'text_input', 'form_field', 'borrowers_personal_data_step1', true),
('borrowers_personal_data.field.last_name', 'text_input', 'form_field', 'borrowers_personal_data_step1', true),
('borrowers_personal_data.field.birth_date', 'date_picker', 'form_field', 'borrowers_personal_data_step1', true),
('borrowers_personal_data.field.citizenship', 'dropdown', 'form_field', 'borrowers_personal_data_step1', true),
('borrowers_personal_data.field.education', 'dropdown', 'form_field', 'borrowers_personal_data_step1', true);
```

### 🧪 Testing Required
1. **Frontend Navigation**: Test complete user flow from calculator to personal data
2. **Content Display**: Verify personal data form renders correctly
3. **Data Validation**: Ensure form validation works for all fields
4. **User Experience**: Confirm flow matches user expectations

## Rollback Instructions

If this change needs to be reverted:

```sql
UPDATE navigation_mapping 
SET 
    screen_location = 'mortgage_step4',
    updated_at = CURRENT_TIMESTAMP
WHERE confluence_num = '6';
```

## Contact & Support

- **Fix Applied**: 2025-08-18 23:21:39 GMT+0300
- **Scripts Location**: `/packages/server/scripts/`
- **Database**: Content database via `navigation_mapping` table
- **API Endpoint**: `GET /api/content/mortgage` (screen 6 entry updated)

## Success Criteria Met

✅ **Navigation Mapping**: Screen #6 now points to correct location  
✅ **API Response**: Updated endpoint returns new mapping  
✅ **Database Consistency**: Change properly recorded with timestamp  
✅ **Rollback Capability**: Documented rollback procedure  
✅ **Documentation**: Complete fix documentation provided  

⚠️ **Pending**: Content creation for `borrowers_personal_data_step1`  
⚠️ **Pending**: Frontend testing and validation