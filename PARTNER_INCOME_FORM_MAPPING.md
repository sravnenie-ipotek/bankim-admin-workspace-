# Screen 6: Анкета партнера. Доходы (Partner's Income Form)
# Date: 18.08.2025 | 10:26

## Confluence Documentation Reference
- **Page Number**: 6
- **Title**: Анкета партнера. Доходы
- **Actions Count**: 20 (from Confluence table)
- **Frontend Estimate**: 6 hours
- **Backend Estimate**: 4 hours

## Database Mapping

### Screen Location
```
screen_location: "other_borrowers_step2"
```

### Navigation Manifest Entry
```json
{
  "id": "mortgage_6",
  "confluence_num": "6",
  "title": "Анкета партнера. Доходы",
  "screen_location": "mortgage_step4"  // Note: May need to be updated to other_borrowers_step2
}
```

## Complete Content Structure (69 items total)

### 1. Page Headers and Titles
```sql
-- Main page title
content_key: "app.other_borrowers.step2.borrowers_income_title"
component_type: "title"
category: "income_details"

-- Income section title  
content_key: "app.other_borrowers.step2.income_title"
component_type: "title"
category: "form"
```

### 2. Main Source of Income Section
```sql
-- Section label
content_key: "app.other_borrowers.step2.source_of_income_label"
component_type: "label"
category: "income_details"

-- Dropdown container
content_key: "other_borrowers_step2.field.main_source"
component_type: "dropdown_container"
category: "main_source"

-- Placeholder
content_key: "other_borrowers_step2.field.main_source_placeholder"
component_type: "placeholder"
category: "main_source"

-- Options
content_key: "other_borrowers_step2.field.main_source_employee"     -- "Наемный работник"
content_key: "other_borrowers_step2.field.main_source_selfemployed"  -- "Самозанятый"
content_key: "other_borrowers_step2.field.main_source_pension"       -- "Пенсионер"
content_key: "other_borrowers_step2.field.main_source_unemployed"    -- "Безработный"
content_key: "other_borrowers_step2.field.main_source_student"       -- "Студент"
content_key: "other_borrowers_step2.field.main_source_unpaid_leave"  -- "В отпуске без сохранения"
content_key: "other_borrowers_step2.field.main_source_other"         -- "Другое"
```

### 3. Field of Activity Section (17 items)
```sql
-- Label
content_key: "other_borrowers_step2.field.field_of_activity_label"
component_type: "label"

-- Placeholder
content_key: "other_borrowers_step2.field.field_of_activity_ph"
component_type: "placeholder"

-- Container
content_key: "other_borrowers_step2.field.field_of_activity"
component_type: "dropdown_container"

-- Options (15 industry sectors)
content_key: "other_borrowers_step2.field.field_of_activity_agriculture"    -- "Сельское хозяйство"
content_key: "other_borrowers_step2.field.field_of_activity_construction"   -- "Строительство"
content_key: "other_borrowers_step2.field.field_of_activity_consulting"     -- "Консалтинг"
content_key: "other_borrowers_step2.field.field_of_activity_education"      -- "Образование"
content_key: "other_borrowers_step2.field.field_of_activity_entertainment"  -- "Развлечения"
content_key: "other_borrowers_step2.field.field_of_activity_finance"        -- "Финансы"
content_key: "other_borrowers_step2.field.field_of_activity_government"     -- "Государственная служба"
content_key: "other_borrowers_step2.field.field_of_activity_healthcare"     -- "Здравоохранение"
content_key: "other_borrowers_step2.field.field_of_activity_manufacturing"  -- "Производство"
content_key: "other_borrowers_step2.field.field_of_activity_real_estate"    -- "Недвижимость"
content_key: "other_borrowers_step2.field.field_of_activity_retail"         -- "Розничная торговля"
content_key: "other_borrowers_step2.field.field_of_activity_technology"     -- "Технологии"
content_key: "other_borrowers_step2.field.field_of_activity_transport"      -- "Транспорт"
content_key: "other_borrowers_step2.field.field_of_activity_other"          -- "Другое"
```

### 4. Professional Sphere Section (Duplicate set - 17 items)
```sql
-- Same structure as field_of_activity but with professional_sphere prefix
content_key: "other_borrowers_step2.field.professional_sphere_label"
content_key: "other_borrowers_step2.field.professional_sphere_ph"
content_key: "other_borrowers_step2.field.professional_sphere"
-- Plus 14 industry options with professional_sphere prefix
```

### 5. Additional Income Section (11 items)
```sql
-- Label
content_key: "other_borrowers_step2_additional_income_label"
component_type: "label"
category: "form"

-- Placeholder
content_key: "other_borrowers_step2_additional_income_ph"
component_type: "placeholder"
category: "form"

-- Container
content_key: "other_borrowers_step2.field.additional_income"
component_type: "dropdown_container"
category: "mortgage"

-- Options
content_key: "other_borrowers_step2.field.additional_income_0_no_additional_income"  -- "Нет дополнительного дохода"
content_key: "other_borrowers_step2.field.additional_income_additional_salary"       -- "Дополнительная зарплата"
content_key: "other_borrowers_step2.field.additional_income_additional_work"         -- "Дополнительная работа"
content_key: "other_borrowers_step2.field.additional_income_property_rental_income"  -- "Доход от сдачи недвижимости"
content_key: "other_borrowers_step2.field.additional_income_investment"              -- "Инвестиции"
content_key: "other_borrowers_step2.field.additional_income_pension"                 -- "Пенсия"
content_key: "other_borrowers_step2.field.additional_income_other"                   -- "Другое"
```

### 6. Obligations Section (12 items)
```sql
-- Title
content_key: "other_borrowers_obligation_title"
component_type: "text"
category: "obligation"

-- Placeholders
content_key: "other_borrowers_obligation_placeholder"
component_type: "placeholder"
category: "obligation"

content_key: "other_borrowers_step2.field.obligations_placeholder"
component_type: "placeholder"
category: "other_borrowers_step2"

-- Container
content_key: "other_borrowers_step2.field.obligations"
component_type: "dropdown_container"
category: "form"

-- Options
content_key: "other_borrowers_step2.field.obligations_no_obligations"  -- "Нет обязательств"
content_key: "other_borrowers_step2.field.obligations_bank_loan"       -- "Банковский кредит"
content_key: "other_borrowers_step2.field.obligations_credit_card"     -- "Кредитная карта"
content_key: "other_borrowers_step2.field.obligations_consumer_credit" -- "Потребительский кредит"

-- Legacy options (might be deprecated)
content_key: "other_borrowers_step2_obligations_option_1"
content_key: "other_borrowers_step2_obligations_option_2"
content_key: "other_borrowers_step2_obligations_option_3"
content_key: "other_borrowers_step2_obligations_option_4"
content_key: "other_borrowers_step2_obligations_option_5"
```

## Frontend Implementation Files

Based on the pattern from the provided information, the files should be located at:

```
mainapp/src/pages/Services/pages/BorrowersPersonalData/SecondStep/SecondStep.tsx
mainapp/src/pages/Services/pages/BorrowersPersonalData/SecondStep/SecondStepForm/SecondStepForm.tsx
```

Or in the current monorepo structure:
```
packages/client/src/pages/OtherBorrowers/Step2/
packages/client/src/components/OtherBorrowersStep2/
```

## Key Features of This Screen

1. **Main Income Source Selection** - Dropdown with 7 employment status options
2. **Field of Activity** - Industry sector selection with 15 options
3. **Professional Sphere** - Duplicate of field of activity (may need consolidation)
4. **Additional Income Sources** - Multiple income types can be added
5. **Financial Obligations** - Existing loans and credit obligations
6. **Dynamic Form Fields** - Fields appear/disappear based on selections
7. **Add/Edit/Delete Functionality** - For additional income and obligations

## Navigation Flow

```
Previous: Screen 5 - Анкета партнера. Личные данные (Partner's Personal Data)
         screen_location: "mortgage_step3" or "other_borrowers_step1"
         ↓
Current: Screen 6 - Анкета партнера. Доходы (Partner's Income)
         screen_location: "other_borrowers_step2"
         ↓
Next:    Screen 7 - Анкета доходов. Наемный работник (Income Form - Employee)
         screen_location: "mortgage_income_employee"
```

## Database Query for Admin Panel

```sql
-- Get all content for this screen
SELECT 
    ci.id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.description,
    ci.is_active
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'other_borrowers_step2'
  AND ci.is_active = true
ORDER BY 
    CASE ci.category
        WHEN 'income_details' THEN 1
        WHEN 'main_source' THEN 2
        WHEN 'form' THEN 3
        WHEN 'obligation' THEN 4
        ELSE 5
    END,
    ci.content_key;
```

## Notes

1. **Total Items**: 69 content items in database
2. **Duplicate Fields**: Professional sphere and field of activity appear to be duplicates
3. **Categories**: Content is organized into 6 categories (form, income_details, main_source, mortgage, obligation, and null)
4. **Legacy Items**: Some obligation options numbered 1-5 may be deprecated
5. **Screen Location Mismatch**: Navigation manifest shows "mortgage_step4" but database uses "other_borrowers_step2"

## Action Items

1. ✅ Verify if professional_sphere and field_of_activity are intentionally duplicated
2. ✅ Update navigation manifest to use correct screen_location
3. ✅ Clean up null category items and assign proper categories
4. ✅ Remove or update legacy obligation options (option_1 through option_5)
5. ✅ Ensure all 20 actions from Confluence are properly mapped