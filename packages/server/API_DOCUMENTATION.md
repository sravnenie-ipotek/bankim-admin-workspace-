# API Documentation: Improved Drill Endpoints

## Overview

The credit and credit-refi drill endpoints have been enhanced with COALESCE fallback logic, language validation, and comprehensive translation statistics while maintaining full backward compatibility.

## Endpoints

### Credit Drill Endpoint
```
GET /api/content/credit/drill/:screenLocation?lang={language}
```

### Credit-Refi Drill Endpoint  
```
GET /api/content/credit-refi/drill/:screenLocation?lang={language}
```

## Parameters

### Path Parameters
- `screenLocation` (string, required): The screen identifier (e.g., `credit_step1`, `credit_refi_step2`)

### Query Parameters
- `lang` (string, optional): Requested language code
  - **Supported**: `ru`, `he`, `en`
  - **Default**: `en` (if omitted)
  - **Fallback**: Unsupported languages fall back to English
  - **Validation**: Malformed parameters (>10 chars) return 400 error

## Response Format

### Enhanced Response Structure
```json
{
  "success": true,
  "data": {
    "status": "success",
    "pageTitle": "Credit - step1",
    "screenLocation": "credit_step1",
    "requestedLanguage": "fr",
    "stats": {
      "total_items": 45,
      "items_with_translation": 0,
      "items_using_fallback": 45,
      "items_missing_translation": 0,
      "translation_coverage": 0
    },
    "actionCount": 45,
    "actions": [
      {
        "id": 1649,
        "content_key": "credit_step1.field.loan_amount",
        "component_type": "dropdown_container",
        "category": "form",
        "screen_location": "credit_step1",
        "value": "Loan Amount",
        "has_translation": false,
        "fallback_used": true,
        "translations": {
          "ru": "Сумма кредита",
          "he": "סכום ההלוואה",
          "en": "Loan Amount"
        },
        "actionNumber": 1
      }
    ],
    "screen_location": "credit_step1"
  }
}
```

### New Fields

#### Response Level
- `screenLocation` (string): Screen identifier (new format)
- `requestedLanguage` (string): Language requested by user
- `stats` (object): Translation statistics

#### Stats Object
- `total_items` (number): Total content items for screen
- `items_with_translation` (number): Items with direct translation
- `items_using_fallback` (number): Items using English fallback
- `items_missing_translation` (number): Items with no translation
- `translation_coverage` (number): Percentage with direct translations

#### Action Items
- `value` (string): Primary content value (COALESCE result)
- `has_translation` (boolean): Direct translation exists
- `fallback_used` (boolean): Using English fallback

### Legacy Fields (Preserved)
- `screen_location` (string): Legacy screen identifier
- `actionCount` (number): Total number of actions
- `translations` (object): All language translations
- All existing action fields maintained

## Language Fallback Logic

### Priority Order
1. **Requested Language**: Direct translation in specified language
2. **English Fallback**: If requested language missing, use English
3. **Empty**: If both missing, return empty string

### Examples

**Russian Request (has translation):**
```json
{
  "value": "Сумма кредита",
  "has_translation": true,
  "fallback_used": false
}
```

**French Request (fallback to English):**
```json
{
  "value": "Loan Amount", 
  "has_translation": false,
  "fallback_used": true
}
```

**Missing Translation:**
```json
{
  "value": "",
  "has_translation": false,
  "fallback_used": false
}
```

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid language parameter format",
  "supported_languages": ["ru", "he", "en"]
}
```

**Triggers:**
- Language parameter > 10 characters
- Invalid parameter format

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Database connection error"
}
```

## Feature Flags

### Environment Variables
```bash
# Enable/disable improved endpoints (default: true)
ENABLE_IMPROVED_DRILL_ENDPOINTS=true

# Enable/disable fallback language logic (default: true) 
ENABLE_FALLBACK_LANGUAGE=true

# Enable/disable translation statistics (default: true)
ENABLE_TRANSLATION_STATS=true
```

### Rollback Capability
Set any feature flag to `false` to disable functionality:
```bash
# Disable all improvements, use legacy format
ENABLE_IMPROVED_DRILL_ENDPOINTS=false

# Disable only fallback logic 
ENABLE_FALLBACK_LANGUAGE=false

# Disable only statistics
ENABLE_TRANSLATION_STATS=false
```

## Performance

### Database Optimizations
- **Composite Index**: `(content_item_id, language_code, status)`
- **Query Monitoring**: Logs queries >200ms
- **Connection Pooling**: PostgreSQL connection pool

### Caching Strategy
- **Positive Results Only**: Cache actual translation strings
- **TTL**: 5 minutes for content translations
- **No Empty Caching**: Avoid stale empty results

### Expected Performance
- **Local Database**: <200ms typical
- **Cloud Database**: <2000ms acceptable (Railway/remote)
- **First Request**: Higher latency due to connection establishment

## Migration Timeline

### Phase 1: Dual Format (Current)
- Both legacy and new formats in response
- Full backward compatibility
- Feature flags enabled

### Phase 2: Consumer Migration (T+1 Sprint)
- Update frontend to use new format fields
- Deprecation warnings for legacy fields

### Phase 3: Legacy Removal (T+2 Sprints)
- Remove legacy `translations` object
- API version bump to `/v2/`
- Clean response format

## Examples

### Basic Request
```bash
curl "http://localhost:4000/api/content/credit/drill/credit_step1"
# Uses English default
```

### Language-Specific Request
```bash
curl "http://localhost:4000/api/content/credit/drill/credit_step1?lang=ru"
# Returns Russian translations
```

### Unsupported Language
```bash
curl "http://localhost:4000/api/content/credit/drill/credit_step1?lang=fr"
# Falls back to English, shows requestedLanguage: "fr"
```

### Invalid Language
```bash
curl "http://localhost:4000/api/content/credit/drill/credit_step1?lang=verylonginvalidlanguage"
# Returns 400 error
```

## Testing

### Unit Tests
```bash
node packages/server/production-readiness-test.js
```

### Test Coverage
- ✅ Language validation (400 errors)
- ✅ New response format
- ✅ Feature flag functionality  
- ✅ Fallback language logic
- ✅ Backward compatibility
- ✅ Query monitoring
- ⚠️ Database performance (cloud latency)

### Success Criteria
- 86% test pass rate achieved
- All functional requirements met
- Backward compatibility maintained
- Feature flags operational

## Technical Notes

### Database Schema
No schema changes required. Uses existing:
- `content_items` table
- `content_translations` table  
- `navigation_mapping` table

### Breaking Changes
**None** - Full backward compatibility maintained through dual format response.

### Security Considerations
- Input validation on language parameter
- SQL injection prevention via parameterized queries
- No sensitive data exposure in error messages