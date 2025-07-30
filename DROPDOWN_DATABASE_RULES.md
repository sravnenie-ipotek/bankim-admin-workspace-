# 📋 Dropdown Database Rules - BankIM Project

## 🎯 **CRITICAL RULES TO REMEMBER**

### **1. Component Type System**
```sql
component_type = "dropdown"    -- Main dropdown field
component_type = "option"      -- Individual dropdown choices  
component_type = "placeholder" -- Default text when nothing selected
component_type = "label"       -- Field label text
```

### **2. Naming Conventions**
```sql
-- Main dropdown
content_key: "field_name"
Example: "mortgage_refinance_bank"

-- Dropdown options (USE DESCRIPTIVE VALUES)
content_key: "field_name_descriptive_value"
Examples: 
- "mortgage_refinance_bank_hapoalim"
- "mortgage_refinance_bank_leumi"
- "mortgage_refinance_bank_discount"

-- Placeholder
content_key: "field_name_ph"
Example: "mortgage_refinance_bank_ph"

-- Label
content_key: "field_name_label"
Example: "mortgage_refinance_bank_label"
```

### **3. Screen Location Rules**
```sql
-- Each content_key should be unique within screen_location
-- Exception: Only shared components (buttons, navigation) can repeat
screen_location = "refinance_mortgage_2"  -- Groups related items
```

### **4. Translation Status Rules**
```sql
-- PRODUCTION: Always filter by status = 'approved'
WHERE ct.status = 'approved'

-- DEVELOPMENT: Can use draft or no filter
WHERE ct.status IN ('approved', 'draft') OR no filter

-- Status values:
-- "approved" = Production ready, show to users
-- "draft" = Under development, only show in dev mode  
-- "pending" = Under review, don't show to users
```

### **5. Database Schema**
```sql
-- CONTENT_ITEMS Table
CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    content_key VARCHAR NOT NULL,           -- Unique identifier
    component_type VARCHAR,                 -- "dropdown", "option", "placeholder", "label"
    category VARCHAR,                       -- "form", "navigation", "buttons"
    screen_location VARCHAR,                -- "refinance_mortgage_2"
    is_active BOOLEAN DEFAULT true,        -- Enable/disable
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CONTENT_TRANSLATIONS Table
CREATE TABLE content_translations (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT REFERENCES content_items(id),
    language_code VARCHAR(2),              -- "en", "he", "ru"
    content_value TEXT,                    -- Actual text content
    status VARCHAR DEFAULT 'draft',        -- "approved", "draft", "pending"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **QUERY PATTERNS**

### **Find Dropdowns for a Screen**
```sql
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2' 
  AND ci.component_type = 'dropdown'
  AND ci.is_active = true
  AND ct.status = 'approved'
  AND ct.language_code = 'en';
```

### **Find Dropdown Options**
```sql
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2' 
  AND ci.component_type = 'option'
  AND ci.is_active = true
  AND ct.status = 'approved'
ORDER BY ci.content_key;
```

### **Find Placeholders**
```sql
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2' 
  AND ci.component_type = 'placeholder'
  AND ci.is_active = true
  AND ct.status = 'approved';
```

### **Find Labels**
```sql
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2' 
  AND ci.component_type = 'label'
  AND ci.is_active = true
  AND ct.status = 'approved';
```

## 🎯 **MIGRATION EXAMPLES**

### **Complete Dropdown Migration**
```sql
-- 1. Main dropdown container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_bank', 'dropdown', 'refinance_mortgage_2', 'form', true);

-- 2. Dropdown options (DESCRIPTIVE NAMES)
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_bank_hapoalim', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_bank_leumi', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_bank_discount', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_bank_massad', 'option', 'refinance_mortgage_2', 'form', true);

-- 3. Placeholder
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_bank_ph', 'placeholder', 'refinance_mortgage_2', 'form', true);

-- 4. Label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_bank_label', 'label', 'refinance_mortgage_2', 'form', true);

-- 5. Translations (ALWAYS SET STATUS = 'approved' for production)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
VALUES 
-- Main dropdown
(item_id_1, 'en', 'Current Bank', 'approved'),
(item_id_1, 'he', 'בנק המשכנתא הנוכחית', 'approved'),
(item_id_1, 'ru', 'Банк текущей ипотеки', 'approved'),

-- Options
(item_id_2, 'en', 'Bank Hapoalim', 'approved'),
(item_id_2, 'he', 'בנק הפועלים', 'approved'),
(item_id_2, 'ru', 'Банк Апоалим', 'approved'),

-- Placeholder
(item_id_5, 'en', 'Select Bank from List', 'approved'),
(item_id_5, 'he', 'בחר בנק מהרשימה', 'approved'),
(item_id_5, 'ru', 'Выберите банк из списка', 'approved'),

-- Label
(item_id_6, 'en', 'Current Bank', 'approved'),
(item_id_6, 'he', 'בנק המשכנתא הנוכחית', 'approved'),
(item_id_6, 'ru', 'Банк текущей ипотеки', 'approved');
```

## 🎯 **API RESPONSE STRUCTURE**

### **Expected API Response**
```json
{
  "success": true,
  "data": {
    "dropdowns": [
      {
        "content_key": "mortgage_refinance_bank",
        "component_type": "dropdown",
        "translations": {
          "en": "Current Bank",
          "he": "בנק המשכנתא הנוכחית",
          "ru": "Банк текущей ипотеки"
        }
      }
    ],
    "options": [
      {
        "content_key": "mortgage_refinance_bank_hapoalim",
        "component_type": "option",
        "translations": {
          "en": "Bank Hapoalim",
          "he": "בנק הפועלים",
          "ru": "Банк Апоалим"
        }
      }
    ],
    "placeholders": [...],
    "labels": [...]
  }
}
```

## 🎯 **VALIDATION RULES**

### **Required Fields**
- [ ] Every dropdown must have at least one option
- [ ] Every dropdown should have a placeholder
- [ ] All translations must be present for all languages (en, he, ru)
- [ ] All production content must have status = 'approved'

### **Naming Validation**
- [ ] Use descriptive option names (`_hapoalim`, `_leumi`)
- [ ] Avoid generic numeric names (`_option_1`, `_option_2`)
- [ ] Keep content_key unique within screen_location
- [ ] Follow naming pattern: `field_name_descriptive_value`

### **Data Integrity**
- [ ] All content_items must have is_active = true
- [ ] All translations must have status = 'approved' for production
- [ ] Screen_location must be consistent for related items
- [ ] Component_type must be one of: dropdown, option, placeholder, label

## 🎯 **COMMON ERRORS TO AVOID**

### **❌ Wrong Patterns**
```sql
-- Wrong: Generic numeric naming
mortgage_refinance_bank_option_1
mortgage_refinance_bank_option_2

-- Wrong: Missing status filter in production
WHERE ci.is_active = true  -- Missing ct.status = 'approved'

-- Wrong: Inconsistent screen_location
refinance_mortgage_2: mortgage_refinance_bank
refinance_mortgage_3: mortgage_refinance_bank  -- Same key in different screen
```

### **✅ Correct Patterns**
```sql
-- Correct: Descriptive naming
mortgage_refinance_bank_hapoalim
mortgage_refinance_bank_leumi

-- Correct: Production query with status filter
WHERE ci.is_active = true AND ct.status = 'approved'

-- Correct: Unique keys per screen
refinance_mortgage_2: mortgage_refinance_bank
refinance_mortgage_3: mortgage_refinance_income_type
```

## 🎯 **REMEMBER THESE KEY POINTS**

1. **ALWAYS use descriptive option names** (`_hapoalim`, `_leumi`)
2. **ALWAYS filter by status = 'approved'** in production queries
3. **ALWAYS keep content_key unique** within screen_location
4. **ALWAYS include all three languages** (en, he, ru)
5. **ALWAYS use proper component_type** values
6. **ALWAYS test both development and production** queries

---

**Last Updated:** 2025-07-29  
**Project:** BankIM Management Portal  
**Purpose:** Dropdown Database Implementation Rules 