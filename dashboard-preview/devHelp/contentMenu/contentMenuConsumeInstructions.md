# 📚 Bankim Translation Rules & Database Logic

> **Audience:** External developers integrating with the `bankim_content` service for dynamic, multi-language content retrieval.

---

## 1. Quick TL;DR

1. All translatable text lives in **two tables**: `content_items` and `content_translations` (PostgreSQL).
2. Read-only public endpoints are available under **`/api/content/*`**.
3. Fallback is automatic – ask for any language, you will always get *something* (default language if missing).
4. Status workflow: `draft → review → approved → archived`. **Only `approved`** rows are exposed publicly.
5. Cache responses aggressively – version is included in the HTTP headers.

---

## 2. Database Model

### 2.1 content_items
| Column | Type | Description |
|--------|------|-------------|
| `id` | `BIGSERIAL` | PK |
| `content_key` | `VARCHAR(255)` **UNIQUE** | Hierarchical key (`app.login.button.sign_in`) |
| `content_type` | `VARCHAR(20)` | `text \| html \| markdown \| json` (default `text`) |
| `category` | `VARCHAR(100)` | Logical grouping (`buttons`, `headers`, …) |
| `screen_location` | `VARCHAR(100)` | Page or component (`login_page`, `mortgage_step1`) |
| `component_type` | `VARCHAR(50)` | UI element (`button`, `dropdown`, …) |
| `description` | `TEXT` | Admin notes |
| `is_active` | `BOOLEAN` | Soft delete flag |
| `created_at / updated_at` | `TIMESTAMP` | Audit fields |

### 2.2 content_translations
| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL` | PK |
| `content_item_id` | `BIGINT` FK → `content_items.id` | |
| `language_code` | `VARCHAR(10)` | ISO-639-1 (`en`, `he`, `ru`, …) |
| `content_value` | `TEXT` | Localised text/json/html |
| `is_default` | `BOOLEAN` | Exactly **one** per `content_item_id` (`en` today) |
| `status` | `VARCHAR(20)` | `draft`, `review`, `approved`, `archived` |
| `created_at / updated_at` | `TIMESTAMP` | |

**Important rules**
1. `(content_item_id, language_code)` is **unique**.
2. Public APIs only expose rows where `status = 'approved'` AND `content_items.is_active = TRUE`.
3. Deleting a `content_item` cascades to its translations.

---

## 3. Public REST API

### 3.1 Get all content for a screen
```
GET /api/content/{screen_location}/{language_code}
```
**Example**
```
GET /api/content/mortgage_step1/he
```
**Response**
```json
{
  "status": "success",
  "screen_location": "mortgage_step1",
  "language_code": "he",
  "content_count": 12,
  "content": {
    "app.mortgage.step1.label.property_value": {
      "value": "שווי הנכס",
      "component_type": "label",
      "category": "form",
      "language": "he",
      "status": "approved"
    },
    "app.mortgage.step1.dropdown.property_ownership_options": {
      "value": ["דירה ראשונה", "דירה שנייה", "נכס להשקעה"],
      "component_type": "dropdown",
      "category": "dropdowns",
      "language": "he",
      "status": "approved"
    }
  }
}
```

### 3.2 Get a single content key (with automatic fallback)
```
GET /api/content/{content_key}/{language_code}
```
If the requested language is missing, the API falls back to the default (`is_default = TRUE`). The JSON includes `fallback_used` for clarity.

### 3.3 Pagination & Filtering (Admin-only)
```
GET /api/content/items?page=1&limit=50&category=headers&status=approved
```
Requires authentication header `Authorization: Bearer <JWT>` (admin token).

---

## 4. Versioning & Caching Strategy

Each successful response returns headers:
```
ETag: W/"<md5-of-body>"
Cache-Control: public, max-age=300
Bankim-Content-Version: <unix-timestamp-of-last-update>
```
*Recommendation:* Cache by `ETag` and revalidate with `If-None-Match`.

---

## 5. Content Key Convention
```
{app}.{section?}.{screen}.{component_type}.{specific_name}
```
*Examples*
- `app.login.button.sign_in`
- `app.profile.placeholder.first_name`
- `app.mortgage.step2.hint.income_source`

---

## 6. Status Workflow
```
draft → review → approved → archived
```
Only **approved** content is served publicly. Other statuses are invisible to external apps.

---

## 7. Data Change Webhooks (Optional)

If you need near-real-time updates, subscribe to the webhook endpoint:
```
POST /api/webhooks/subscribe
BODY: { "url": "https://yourapp.com/hooks/bankim-content" }
```
Events:
- `content.updated`
- `content.created`
- `content.archived`

---

## 8. Error Codes
| HTTP | Meaning |
|------|---------|
| `404` | `content_key` not found or inactive |
| `422` | Validation error on POST/PUT |
| `500` | Internal server/database error |

---

## 9. Example SQL: Pull all approved Hebrew translations for *login* page
```sql
SELECT ci.content_key,
       ct.content_value
FROM   content_items ci
JOIN   content_translations ct ON ct.content_item_id = ci.id
WHERE  ci.screen_location = 'login_page'
  AND  ct.language_code = 'he'
  AND  ct.status = 'approved'
  AND  ci.is_active = TRUE
ORDER  BY ci.content_key;
```

---

## 10. Future Enhancements
- Add **GraphQL** endpoint for more flexible queries
- Implement **revision history API** (`/api/content/versions/:id`)
- OAuth2 scopes for fine-grained access (`read:content`, `write:content`)

---

## 11. What **Your** App Needs to Consume

| Priority | Table | Purpose | Fields You Actually Need | Notes |
|----------|-------|---------|--------------------------|-------|
| 1 | `content_items` | Master list of translatable keys | `id`, `content_key`, `component_type`, `screen_location`, `category` | Filter with `is_active = TRUE` |
| 2 | `content_translations` | Language-specific values | `content_item_id`, `language_code`, `content_value` | Filter with `status = 'approved'` |
| 3 | `languages` | Supported language metadata | `code`, `name`, `native_name`, `direction` | Use to build language selector / RTL support |
| 4 | `content_categories` _(optional)_ | Human-friendly grouping | `id`, `name`, `display_name` | Only if you need category hierarchy |

**Minimal Join Example**
```sql
SELECT ci.content_key,
       ct.language_code,
       ct.content_value
FROM   content_items ci
JOIN   content_translations ct ON ct.content_item_id = ci.id
WHERE  ci.is_active = TRUE
  AND  ct.status = 'approved';
```

---

### 11.1 Recommended Sync Pipeline
1. **Initial full sync** – Pull all approved translations for required languages.
2. **Cache locally** (file, Redis, etc.) keyed by `content_key` + `language_code`.
3. **Listen to webhooks** (`content.updated`, `content.created`, `content.archived`) to perform **delta updates**.
4. **Fallback** – If a key is missing for the requested language, fall back to the record where `is_default = TRUE`.

---

### 11.2 Typical Data Shapes

```jsonc
// After your ETL / cache warm-up you will end up with something like:
{
  "app.login.button.sign_in": {
    "en": "Sign In",
    "he": "כניסה",
    "ru": "Войти"
  },
  "app.dashboard.header.welcome": {
    "en": "Welcome back, {{user_name}}!",
    "ru": "Снова здравствуй, {{user_name}}!"
  }
}
```

Use `{{placeholders}}` for dynamic inserts – they *do not* come from the DB, you replace them at runtime.

---

### 11.3 Do **NOT**
- Do **NOT** write/modify these tables directly – use the admin API.
- Do **NOT** rely on row order – always sort by `content_key`.
- Do **NOT** assume English is always default – check `is_default` flag.

---

*Integration contact: dev@bankim.online*

*Last updated: {{DATE}} (integration instructions appended)*
