# Technical Analysis: Credit & Credit-Refi Content Structure

## Database Schema & Current State

### 1. How Content is Stored

```sql
-- Content items exist in database
SELECT COUNT(*) FROM content_items 
WHERE screen_location LIKE 'credit%';
-- Result: 705 items (342 credit + 363 credit_refi)

-- But translations are missing
SELECT COUNT(*) FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location LIKE 'credit%';
-- Result: 513 translations (only 24% coverage for 3 languages)
```

### 2. Current API Fetch Implementation

#### Drill Endpoint Query (packages/server/server.js:2195-2235)
```javascript
// Credit-Refi Drill Endpoint
const query = `
  SELECT 
    ci.*,
    COALESCE(
      MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END),
      ''
    ) as content_ru,
    COALESCE(
      MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END),
      ''
    ) as content_he,
    COALESCE(
      MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END),
      ''
    ) as content_en
  FROM content_items ci
  LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    AND ct.status IN ('approved', 'draft')  -- Fixed to include draft
  WHERE ci.screen_location = $1 
    AND ci.is_active = TRUE
  GROUP BY ci.id
  ORDER BY ci.page_number, ci.id
`;
```

### 3. Example: What's Actually in the Database

#### For credit_refi_step2 (34 items, 0 translations):
```sql
SELECT id, content_key, component_type, category 
FROM content_items 
WHERE screen_location = 'credit_refi_step2' 
LIMIT 5;
```
**Result:**
```
id    | content_key                          | component_type | category
------|--------------------------------------|----------------|----------
45612 | credit_refi_step2_title              | text          | form
45613 | credit_refi_step2_subtitle           | text          | form  
45614 | credit_refi_step2_field_loan_amount  | input         | form
45615 | credit_refi_step2_field_loan_purpose | dropdown      | form
45616 | credit_refi_step2_field_property_type| dropdown      | form
```

**Translation Query:**
```sql
SELECT * FROM content_translations 
WHERE content_item_id IN (45612, 45613, 45614, 45615, 45616);
```
**Result:** 0 rows (NO TRANSLATIONS)

### 4. What the API Returns

#### When fetching credit_refi_step2:
```json
GET /api/credit-refi/drill/credit_refi_step2

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 45612,
        "content_key": "credit_refi_step2_title",
        "component_type": "text",
        "content_ru": "",  // EMPTY
        "content_he": "",  // EMPTY
        "content_en": ""   // EMPTY
      },
      // ... 33 more items with empty translations
    ]
  }
}
```

### 5. The Problem Visualized

```
Database Structure:
┌─────────────────┐         ┌──────────────────┐
│  content_items  │ 1----*  │content_translations│
├─────────────────┤         ├──────────────────┤
│ id              │←────────│ content_item_id  │
│ content_key     │         │ language_code    │
│ screen_location │         │ content_value    │
│ component_type  │         │ status           │
└─────────────────┘         └──────────────────┘
     ✅ 705 items              ❌ Only 513 translations
                               (Need 2,115 for full coverage)
```

## Technical Questions

### 1. Translation Source
```sql
-- These content_items exist but have no translations:
SELECT ci.content_key, ci.component_type
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'credit_refi_step2'
  AND ct.id IS NULL;
-- Returns 34 items needing translations
```

**QUESTION:** Should we:
- A) Generate translations based on content_key patterns?
- B) Copy from similar mortgage screens?
- C) Wait for translation import from external source?
- D) Use AI to generate contextual translations?

### 2. Content Key Pattern Analysis
```sql
-- Credit-refi content keys follow this pattern:
SELECT DISTINCT 
  SPLIT_PART(content_key, '_', 3) as section,
  COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'credit_refi_%'
GROUP BY SPLIT_PART(content_key, '_', 3);
```

**Pattern found:**
- `credit_refi_{page}_{element_type}` format
- Similar to mortgage pattern: `mortgage_{page}_{element_type}`

**QUESTION:** Can we adapt mortgage translations using this mapping?
```javascript
// Potential mapping logic
const translateCreditFromMortgage = (mortgageKey) => {
  return mortgageKey
    .replace('mortgage_', 'credit_')
    .replace('refinance_', 'credit_refi_')
    .replace('property', 'loan')  // Property → Loan context
    .replace('dwelling', 'credit'); // Dwelling → Credit context
};
```

### 3. Database Integrity Check
```sql
-- Check for orphaned translations
SELECT COUNT(*) FROM content_translations ct
LEFT JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.id IS NULL;
-- Result: 0 (good - no orphans)

-- Check for duplicate content_keys
SELECT content_key, COUNT(*) 
FROM content_items 
WHERE screen_location LIKE 'credit%'
GROUP BY content_key 
HAVING COUNT(*) > 1;
-- Result: 0 (good - all keys unique)
```

### 4. API Behavior Questions

**Current behavior when no translations:**
- Returns empty strings for content_ru/he/en
- Frontend shows blank fields in edit modals
- Users see "undefined" or empty content

**QUESTION:** Should the API:
- A) Return null instead of empty strings?
- B) Generate placeholder text from content_key?
- C) Return a flag indicating "needs_translation"?
- D) Fallback to English or another default language?

### 5. Bulk Translation Strategy

```javascript
// Option A: Bulk insert with defaults
const bulkTranslateDefaults = async () => {
  const query = `
    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
    SELECT 
      ci.id,
      lang.code,
      REPLACE(ci.content_key, '_', ' '),  -- Generate from key
      'draft'
    FROM content_items ci
    CROSS JOIN (VALUES ('ru'), ('he'), ('en')) AS lang(code)
    LEFT JOIN content_translations ct 
      ON ci.id = ct.content_item_id 
      AND ct.language_code = lang.code
    WHERE ci.screen_location LIKE 'credit%'
      AND ct.id IS NULL;
  `;
};

// Option B: Copy from mortgage with transformation
const copyFromMortgage = async () => {
  const query = `
    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
    SELECT 
      ci_credit.id,
      ct_mortgage.language_code,
      REPLACE(ct_mortgage.content_value, 'ипотек', 'кредит'),  -- Russian
      'draft'
    FROM content_items ci_credit
    JOIN content_items ci_mortgage 
      ON ci_mortgage.content_key = REPLACE(ci_credit.content_key, 'credit', 'mortgage')
    JOIN content_translations ct_mortgage 
      ON ci_mortgage.id = ct_mortgage.content_item_id
    WHERE ci_credit.screen_location LIKE 'credit%'
      AND NOT EXISTS (
        SELECT 1 FROM content_translations 
        WHERE content_item_id = ci_credit.id
      );
  `;
};
```

## Immediate Technical Decisions Needed

### 1. **Empty Translation Handling**
Should `content_value = ''` be treated as:
- Valid empty content?
- Missing translation requiring action?
- Default to content_key display?

### 2. **Translation Generation Method**
Which approach for the 1,602 missing translations:
- **A)** Bulk generate from content_keys
- **B)** Copy/adapt from mortgage sections
- **C)** Import from external translation file
- **D)** Manual entry through admin UI
- **E)** AI-assisted contextual generation

### 3. **API Response Format**
For items without translations, return:
```javascript
// Option 1: Current (empty strings)
{ content_ru: "", content_he: "", content_en: "" }

// Option 2: Nulls
{ content_ru: null, content_he: null, content_en: null }

// Option 3: Metadata included
{ 
  content_ru: "", 
  content_he: "", 
  content_en: "",
  needs_translation: true,
  suggested_text: "Generated from: credit_refi_step2_title"
}
```

### 4. **Frontend Behavior**
When editing empty translations, should the UI:
- Show blank fields (current)
- Pre-fill with generated suggestions
- Show content_key as placeholder
- Require all 3 languages before saving

## Next Steps?

Please advise on:
1. **Translation source/method** (where do we get the actual content?)
2. **API behavior** for missing translations
3. **Priority** of credit vs credit-refi sections
4. **Temporary solution** while waiting for real content

The infrastructure is ready. We just need direction on content population strategy.