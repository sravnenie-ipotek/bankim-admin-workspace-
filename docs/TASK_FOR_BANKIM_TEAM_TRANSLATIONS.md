# 📋 **TASK FOR BANKIM DEV TEAM: Missing Translations**

**Date**: August 24, 2025  
**Priority**: HIGH  
**Affected Areas**: Credit & Credit-Refinancing Flows  
**Document to Follow**: `/docs/Architecture/MASTER_TRANSLATION_SYSTEM.md`

---

## 🚨 **PROBLEM SUMMARY**

The BankIM Management Portal has **388 content items without translations**, causing "Translation missing" errors throughout the credit and credit-refinancing workflows. The database structure exists, but translations are empty.

### **Affected Screens (22 total)**
- **Credit Flow**: 2 screens, 45 items total
  - `credit_income_employed` - 22 items
  - `credit_personal_data` - 23 items
  
- **Credit-Refinancing Flow**: 20 screens, 343 items total
  - `credit_refi_step1` - 41 items
  - `credit_refi_step2` - 34 items
  - `credit_refi_program_selection` - 15 items
  - (17 more screens listed below)

---

## 📝 **WHAT WE NEED FROM YOU**

### **1. Business Translations for Each Screen**

We need **ACTUAL BUSINESS CONTENT** for each content item in **3 languages**:
- Russian (ru)
- Hebrew (he)  
- English (en)

### **Example Format We Need:**

For screen `credit_income_employed`:
```excel
| content_key | Russian | Hebrew | English |
|-------------|---------|---------|---------|
| credit_income_employed.item_1 | Место работы | מקום עבודה | Workplace |
| credit_income_employed.item_2 | Должность | תפקיד | Position |
| credit_income_employed.item_3 | Ежемесячный доход | הכנסה חודשית | Monthly Income |
| credit_income_employed.item_4 | Стаж работы | ותק בעבודה | Work Experience |
```

For screen `credit_refi_program_selection`:
```excel
| content_key | Russian | Hebrew | English |
|-------------|---------|---------|---------|
| credit_refi_program_selection.item_1 | Стандартная программа | תוכנית רגילה | Standard Program |
| credit_refi_program_selection.item_2 | Льготная программа | תוכנית מוטבת | Preferential Program |
| credit_refi_program_selection.item_3 | Экспресс рефинансирование | מימון מחדש מהיר | Express Refinancing |
```

---

## 🗄️ **DATABASE STRUCTURE (Per MASTER_TRANSLATION_SYSTEM.md)**

### **Required Fields for Each Translation:**
```sql
-- Each translation MUST have:
content_item_id    -- Links to content_items.id
language_code      -- 'ru', 'he', or 'en'
field_name        -- 'text' for most content
content_value     -- The actual translation
status            -- 'approved' for production
```

### **Proper Insert Pattern (Lines 746-759 of MASTER_TRANSLATION_SYSTEM.md):**
```sql
INSERT INTO content_translations (content_item_id, language_code, field_name, content_value, status)
VALUES 
  (item_id, 'ru', 'text', 'Место работы', 'approved'),
  (item_id, 'he', 'text', 'מקום עבודה', 'approved'),
  (item_id, 'en', 'text', 'Workplace', 'approved');
```

---

## 📊 **COMPLETE LIST OF SCREENS NEEDING TRANSLATIONS**

### **Credit Screens (45 items)**
1. `credit_income_employed` - 22 items
2. `credit_personal_data` - 23 items

### **Credit-Refi Screens (343 items)**
1. `credit_refi_account_locked_modal` - 4 items
2. `credit_refi_coborrower_income` - 24 items
3. `credit_refi_coborrower_personal` - 25 items
4. `credit_refi_income_form` - 22 items
5. `credit_refi_income_source_modal_1` - 18 items
6. `credit_refi_income_source_modal_2` - 18 items
7. `credit_refi_loading` - 6 items
8. `credit_refi_login` - 12 items
9. `credit_refi_obligation_modal_1` - 16 items
10. `credit_refi_partner_income` - 26 items
11. `credit_refi_partner_personal` - 23 items
12. `credit_refi_password_reset` - 10 items
13. `credit_refi_personal_data` - 25 items
14. `credit_refi_phone_verification` - 18 items
15. `credit_refi_program_selection` - 15 items
16. `credit_refi_registration` - 18 items
17. `credit_refi_registration_success_toast` - 2 items
18. `credit_refi_step1` - 41 items
19. `credit_refi_step2` - 34 items
20. `credit_refi_wrong_password_modal` - 6 items

**TOTAL: 388 content items × 3 languages = 1,164 translations needed**

---

## 🎯 **DELIVERABLE OPTIONS**

### **Option 1: Excel/CSV File (Preferred)**
Provide an Excel or CSV file with columns:
- `screen_location` (e.g., "credit_refi_step1")
- `content_key` (e.g., "credit_refi_step1.item_1")
- `russian_text`
- `hebrew_text`
- `english_text`

### **Option 2: Direct Database Script**
Provide SQL INSERT statements following the pattern in MASTER_TRANSLATION_SYSTEM.md

### **Option 3: JSON Format**
```json
{
  "credit_refi_program_selection": {
    "item_1": {
      "ru": "Стандартная программа",
      "he": "תוכנית רגילה",
      "en": "Standard Program"
    },
    "item_2": {
      "ru": "Льготная программа",
      "he": "תוכנית מוטבת",
      "en": "Preferential Program"
    }
  }
}
```

---

## ⚠️ **CRITICAL REQUIREMENTS**

### **Must Follow MASTER_TRANSLATION_SYSTEM.md:**
1. **Use Content Database ONLY** (`CONTENT_DATABASE_URL`)
2. **Never use Main Database** for translations
3. **Required columns**: `field_name='text'`, `status='approved'`
4. **Content pattern**: Meaningful business translations, not generic labels

### **Priority Order:**
1. **HIGH**: `credit_refi_step1`, `credit_refi_step2`, `credit_refi_program_selection`
2. **MEDIUM**: Login/registration screens
3. **LOW**: Modal and toast messages

---

## 📞 **QUESTIONS TO ANSWER**

1. **Do you have these translations in your production system?**
   - If yes, can you export them?
   
2. **What are the exact field labels for credit application forms?**
   - Income fields
   - Personal data fields
   - Employment information
   
3. **What are the refinancing program names and descriptions?**
   - Standard programs
   - Special offers
   - Requirements for each

4. **Are there specific regulatory/compliance texts required?**
   - Legal disclaimers
   - Privacy notices
   - Terms and conditions

---

## 📂 **FILES TO REFERENCE**

- **Documentation**: `/docs/Architecture/MASTER_TRANSLATION_SYSTEM.md`
- **Database Schema**: Lines 130-165 of MASTER_TRANSLATION_SYSTEM.md
- **Insert Pattern**: Lines 746-759 of MASTER_TRANSLATION_SYSTEM.md
- **Content Key Pattern**: Lines 83-94 of MASTER_TRANSLATION_SYSTEM.md

---

## ✅ **DEFINITION OF DONE**

- [ ] All 388 content items have translations in all 3 languages
- [ ] Translations follow MASTER_TRANSLATION_SYSTEM.md requirements
- [ ] Each translation has `field_name='text'` and `status='approved'`
- [ ] Content is meaningful business text, not placeholders
- [ ] Drill-down pages show actual content instead of "Translation missing"

---

## 🚀 **HOW TO VERIFY COMPLETION**

```sql
-- Run this query to verify all translations are complete:
SELECT 
  ci.screen_location,
  COUNT(DISTINCT ci.id) as content_items,
  COUNT(DISTINCT ct.content_item_id) as items_with_translations,
  COUNT(ct.id) as total_translations,
  COUNT(ct.id)::float / (COUNT(DISTINCT ci.id) * 3) * 100 as completion_percentage
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
  AND ct.field_name = 'text' 
  AND ct.status = 'approved'
WHERE ci.screen_location IN (
  'credit_income_employed', 'credit_personal_data',
  -- ... all 22 screens
)
GROUP BY ci.screen_location
ORDER BY ci.screen_location;
```

**Expected Result**: 100% completion for all screens

---

## 📧 **CONTACT FOR QUESTIONS**

If you need:
- List of exact content_item IDs
- Current database export
- Specific field requirements
- Context about any screen

Please let us know and we can provide additional details.

---

**Thank you for your help in completing these critical translations!**