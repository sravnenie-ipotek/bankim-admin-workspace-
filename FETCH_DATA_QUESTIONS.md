# Technical Questions: How to Fetch Credit/Credit-Refi Data

## Current Data Fetching Implementation

### 1. How Drill Endpoints Currently Fetch Data

**Credit-Refi Drill Endpoint** (`/api/content/credit-refi/drill/:screenLocation`):
```sql
SELECT 
  ci.id,
  ci.content_key,
  ci.component_type,
  ci.category,
  ci.screen_location,
  MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
  MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
  MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
  AND ct.status IN ('approved', 'draft')
WHERE ci.screen_location = $1 
  AND ci.is_active = TRUE
GROUP BY ci.id
ORDER BY ci.page_number, ci.id
```

### 2. What This Returns

**Example for `credit_refi_step2`:**
```json
{
  "actions": [
    {
      "id": 45612,
      "content_key": "credit_refi_step2_title",
      "component_type": "text",
      "translations": {
        "ru": "",  // EMPTY - no translation exists
        "he": "",  // EMPTY - no translation exists
        "en": ""   // EMPTY - no translation exists
      }
    }
    // ... 33 more items all with empty translations
  ]
}
```

## Questions About Data Fetching Strategy

### Question 1: Should we fetch from different sources?

**Current:** Fetching only from `content_translations` table
**Alternative Options:**

A) **Fetch from mortgage translations as fallback?**
```sql
-- Should we add this fallback logic?
COALESCE(
  MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END),
  -- Fallback to mortgage translation with similar key?
  (SELECT content_value FROM content_translations ct2 
   JOIN content_items ci2 ON ct2.content_item_id = ci2.id
   WHERE ci2.content_key LIKE 'mortgage%' || SUBSTRING(ci.content_key FROM 10)
   AND ct2.language_code = 'ru'
   LIMIT 1),
  ''
) as text_ru
```

B) **Fetch from a mapping table?**
```sql
-- Should we create a translation_mappings table?
CREATE TABLE translation_mappings (
  credit_key VARCHAR(255),
  mortgage_key VARCHAR(255),
  use_mortgage_translation BOOLEAN
);
```

### Question 2: Should we fetch computed/generated values?

**Current:** Direct fetch from database
**Alternative:** Generate from content_key when empty?

```javascript
// Should the API compute translations on-the-fly?
const generateTranslation = (content_key, language) => {
  // Extract meaningful parts from key
  const parts = content_key.split('_');
  if (parts[2] === 'step2' && parts[3] === 'title') {
    return language === 'ru' ? 'Шаг 2: Информация о кредите' :
           language === 'he' ? 'שלב 2: פרטי האשראי' :
           'Step 2: Credit Information';
  }
  return null;
};
```

### Question 3: Should we fetch from multiple sources and merge?

```javascript
// Option A: Current - single source
const fetchCreditData = async (screenLocation) => {
  return await pool.query(currentQuery, [screenLocation]);
};

// Option B: Multiple sources with priority
const fetchCreditDataWithFallbacks = async (screenLocation) => {
  // 1. Try content_translations
  const translations = await getTranslations(screenLocation);
  
  // 2. If empty, try mortgage mappings
  if (!hasTranslations(translations)) {
    const mortgageData = await getMortgageMappings(screenLocation);
    if (mortgageData) return mortgageData;
  }
  
  // 3. If still empty, try external API
  const externalData = await fetchFromExternalSource(screenLocation);
  if (externalData) return externalData;
  
  // 4. Finally, generate defaults
  return generateDefaults(screenLocation);
};
```

### Question 4: Should we change the JOIN strategy?

**Current:** LEFT JOIN with all translations
**Alternative options:**

A) **INNER JOIN to show only items with translations?**
```sql
-- Only show items that have at least one translation
INNER JOIN content_translations ct ON ci.id = ct.content_item_id
```

B) **Multiple JOINs for fallback languages?**
```sql
-- Primary language with fallback
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
  AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
  AND ct_en.language_code = 'en'
-- Use English as fallback for missing Russian
COALESCE(ct_ru.content_value, ct_en.content_value, '') as text_ru
```

### Question 5: Should we fetch from a different schema/database?

```javascript
// Current: Single database
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

// Alternative: Multiple data sources?
const pools = {
  content: new Pool({ connectionString: CONTENT_DB }),
  translations: new Pool({ connectionString: TRANSLATION_DB }),
  external: new Pool({ connectionString: EXTERNAL_DB })
};

const fetchWithMultipleSources = async (screenLocation) => {
  // Try primary source
  let data = await pools.content.query(...);
  
  // If no translations, try translation database
  if (!hasTranslations(data)) {
    data = await pools.translations.query(...);
  }
  
  return data;
};
```

### Question 6: Should we implement caching for empty translations?

```javascript
// Should we cache the fact that translations are missing?
const translationCache = new Map();

const fetchWithCache = async (screenLocation) => {
  // Check if we know this screen has no translations
  if (translationCache.has(screenLocation)) {
    const cached = translationCache.get(screenLocation);
    if (cached.isEmpty && cached.checkedAt > Date.now() - 3600000) {
      // Return generated/default content instead of querying
      return generateDefaultContent(screenLocation);
    }
  }
  
  // Proceed with database query
  const result = await pool.query(...);
  
  // Cache the emptiness
  if (isEmptyTranslations(result)) {
    translationCache.set(screenLocation, {
      isEmpty: true,
      checkedAt: Date.now()
    });
  }
  
  return result;
};
```

## 🔴 MAIN QUESTION: How Should We Fetch the Data?

Given that:
- **705 content_items exist** in the database
- **Only 513 translations exist** (mostly for mortgage sections)
- **Credit/Credit-Refi sections have mostly empty translations**

**Should the fetching strategy be:**

1. **Keep current:** Fetch from content_translations, return empty when missing
2. **Add fallbacks:** Try multiple sources (mortgage → external → generated)
3. **Generate on-the-fly:** Create translations from content_keys when missing
4. **Change source:** Fetch from different table/database/API
5. **Hybrid approach:** Combination of above based on component_type

**Please specify the preferred data fetching strategy so we can implement the correct solution.**