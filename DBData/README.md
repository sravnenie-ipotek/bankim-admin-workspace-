# Database Documentation

> Directory: `DBData/`
>
> Last updated: 2025-07-26

---

## 1. Core Tables

| Table | Purpose |
|-------|---------|
| `languages` | Master list of supported languages. One row is flagged `is_default = TRUE`. |
| `content_categories` | Logical grouping of content (`dropdowns`, `titles`, etc.). |
| `content_items` | **Single source of truth** for every UI element / action that can be translated or configured. |
| `content_translations` | Holds the translations for each `content_item_id` + `language_code`. |

### Important Columns in `content_items`
| Column | Description |
|--------|-------------|
| `content_key` | Unique semantic key (e.g. `app.main.action.1.dropdown.income_source`). |
| `screen_location` | **Page / screen identifier** (e.g. `mortgage_calculation`, `about`, `navigation`). Used to GROUP items that belong to the same UI page. |
| `component_type` | UI component (`dropdown`, `link`, `text`, `option`, …). |
| `action_count` | (NEW) Pre-computed number of actions on the page. |

---

## 2. Views

### 2.1 `v_page_action_counts`
Aggregates **how many actions** each page contains.

```sql
CREATE OR REPLACE VIEW v_page_action_counts AS
SELECT
    screen_location,
    COUNT(*)        AS action_count,
    MAX(updated_at) AS last_modified
FROM content_items
WHERE is_active = TRUE
GROUP BY screen_location;
```

*Sample output*
| screen_location | action_count | last_modified |
|-----------------|--------------|---------------|
| `mortgage_calculation` | 15 | 2025-07-15 10:22:33 |
| `about` | 2 | 2025-07-14 18:01:11 |

### 2.2 `v_mortgage_content`
Detailed view used by the **Mortgage** submenu (`/content/mortgage`). It hides all the joins / filters from the application layer.

```sql
CREATE OR REPLACE VIEW v_mortgage_content AS
SELECT ...   -- see `database/create_submenu_views.sql`
```

#### Adding more sub-menus
Copy-paste the definition of `v_mortgage_content` and change the `screen_location` predicate:

```sql
-- Example for credit calculator
CREATE OR REPLACE VIEW v_credit_content AS
SELECT ...
WHERE ci.screen_location = 'credit_calculation';
```

---

## 3. Migrations / Execution

1. **Run the view migration**
   ```bash
   psql $DATABASE_URL -f database/create_submenu_views.sql
   ```
2. Verify views exist:
   ```sql
   \dv+ v_*;
   SELECT * FROM v_page_action_counts LIMIT 5;
   ```

---

## 4. API Integration Guide

| Endpoint | DB Object |
|----------|-----------|
| `GET /api/content/mortgage` | `v_mortgage_content` |
| `GET /api/content/credit`   | (create) `v_credit_content` |

The backend should **select from the view** instead of touching raw tables.
This guarantees consistent logic and makes future refactors painless. 