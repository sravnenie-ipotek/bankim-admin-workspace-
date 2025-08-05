# Database Access Guide for External Applications

## Overview

This document provides external applications with the essential information needed to read data from the banking application database. It focuses on database structure, connection patterns, and data access methods for integration purposes.

## Database Connection Information

### Connection Details
- **Database Type**: PostgreSQL 14+
- **Host**: Railway Cloud PostgreSQL
- **Default Port**: 43809 (custom Railway port)
- **Architecture**: Single PostgreSQL instance with dual connection pools

### Connection String
```bash
DATABASE_URL=postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway
```

### Connection Architecture
- **Main Database Pool**: Business logic, users, loans, financial data
- **Content Database Pool**: Multi-language translations and content management
- **Note**: Both pools connect to the same PostgreSQL instance

## Complete Database Mapping

### Table Categories Overview

#### Authentication & Sessions (3 tables)
- `users` - Staff accounts (email auth)
- `clients` - Customer accounts (SMS auth)
- `sessions` - JWT token management

#### Client Financial Profile (8 tables)
- `client_identity` - Identity verification documents
- `client_credit_history` - Credit scores and history
- `client_employment` - Employment and income details
- `client_assets` - Financial assets and accounts
- `client_debts` - Existing debt obligations
- `properties` - Real estate information
- `loan_applications` - Loan requests and status
- `loan_calculations` - Calculation history (JSONB)

#### Banking Configuration (4 tables)
- `banks` - Israeli bank information
- `banking_standards` - Bank-specific parameters
- `calculation_parameters` - Global loan parameters
- `cities` - Location data

#### Content Management (2 tables)
- `content_items` - Master content definitions
- `content_translations` - Multi-language translations

#### System Administration (2 tables)
- `params` - System configuration
- `app_logs` - Application logging

### Table Details Reference

#### Authentication Tables
- **users**: Staff accounts with email-based authentication
- **clients**: Customer accounts with SMS phone authentication  
- **sessions**: JWT token management and session tracking

#### Client Financial Profile Tables
- **client_identity**: Identity verification documents and verification status
- **client_credit_history**: Credit scores (300-850), credit history years, utilization rates
- **client_employment**: Employment type, monthly income, job verification status
- **client_assets**: Bank accounts, investments, property assets with current values
- **client_debts**: Existing debt obligations for DTI ratio calculations
- **properties**: Real estate information, market values, ownership percentages
- **loan_applications**: Loan requests with status tracking and bank assignments
- **loan_calculations**: Historical calculation data stored in JSONB format

#### Banking Configuration Tables
- **banks**: Israeli bank information with bank codes and active status
- **banking_standards**: Bank-specific parameters for loan calculations
- **calculation_parameters**: Global loan calculation parameters (rates, ratios, limits)
- **cities**: Location data for addresses and demographic information

#### Content Management Tables  
- **content_items**: Master content definitions with keys and screen locations
- **content_translations**: Multi-language translations (English, Hebrew, Russian)

#### System Administration Tables
- **params**: Global system configuration parameters
- **app_logs**: Application logging with severity levels and metadata

### Entity Relationship Diagram (Text Format)

```
AUTHENTICATION FLOW:
users (staff)                clients (customers)
  ↓                             ↓
sessions ←------- JWT -------→ sessions

CLIENT DATA HIERARCHY:
clients (id, phone, name)
  ├── client_identity (verification docs)
  ├── client_credit_history (credit score, history)
  ├── client_employment (income, job details)
  ├── client_assets (bank accounts, investments)  
  ├── client_debts (existing obligations)
  ├── properties (real estate owned)
  ├── loan_applications (loan requests)
  │   ├── → loan_calculations (JSONB history)
  │   └── → client_documents (file uploads)
  └── calculation data flows

BANKING CONFIGURATION:
banks (id, name, code)
  ├── banking_standards (bank-specific params)
  └── loan_applications (bank assignment)

calculation_parameters (global settings)
  └── used by loan calculations

CONTENT MANAGEMENT:
content_items (keys, screens, types)
  └── content_translations (multi-language values)
      ├── language_code: 'en' (primary)
      ├── language_code: 'he' (Hebrew RTL)
      └── language_code: 'ru' (Russian)

SYSTEM ADMINISTRATION:
params (global config)
app_logs (application logging)
cities (location reference)
```

### Foreign Key Relationships

#### Primary Relationships
- `sessions.user_id` → `clients.id` (customer sessions)
- `client_*` tables → `clients.id` (all client data)
- `loan_applications.client_id` → `clients.id`
- `loan_applications.property_id` → `properties.id`
- `loan_applications.bank_id` → `banks.id`
- `content_translations.content_item_id` → `content_items.id`

#### Cascade Behavior
- **CASCADE DELETE**: Client deletion removes all related financial data
- **SET NULL**: Optional references (bank, property) become null on deletion
- **RESTRICT**: Prevent deletion of referenced records

### Available Indexes for Performance
- **users**: email, created_at
- **sessions**: token, expires_at, user_id
- **client_identity**: client_id, id_number
- **client_credit_history**: client_id
- **loan_applications**: client_id, application_status, application_number
- **client_debts**: client_id, is_active
- **content_items**: screen_location, content_key
- **content_translations**: language_code, status
- **banking_standards**: bank_id
- **calculation_parameters**: parameter_name

## Critical Tables for External Access

### 1. User Authentication

#### Active Sessions
```sql
-- Check if user session is valid
SELECT c.id, c.name, c.phone, s.expires_at
FROM sessions s
JOIN clients c ON s.user_id = c.id
WHERE s.token = $1 AND s.expires_at > NOW();
```

#### User Types
- **clients**: Customer accounts (phone + SMS auth)
- **users**: Staff accounts (email auth)
- **sessions**: JWT token management

### 2. Client Financial Profile

#### Complete Client Data
```sql
SELECT 
    c.id, c.name, c.phone, c.created_at,
    -- Identity verification
    ci.id_number, ci.verification_status,
    -- Credit information
    ch.credit_score, ch.credit_history_years, ch.current_credit_utilization,
    -- Employment
    ce.employment_type, ce.monthly_income, ce.years_at_current_job,
    -- Assets
    ca.asset_type, ca.current_balance, ca.estimated_value,
    -- Property
    p.property_address, p.current_market_value, p.ownership_percentage
FROM clients c
LEFT JOIN client_identity ci ON c.id = ci.client_id
LEFT JOIN client_credit_history ch ON c.id = ch.client_id
LEFT JOIN client_employment ce ON c.id = ce.client_id
LEFT JOIN client_assets ca ON c.id = ca.client_id
LEFT JOIN properties p ON c.id = p.client_id
WHERE c.id = $1;
```

#### Key Financial Tables
- **client_credit_history**: Credit scores (300-850 range)
- **client_employment**: Income and job details
- **client_assets**: Bank accounts and investments
- **client_debts**: Existing obligations
- **properties**: Real estate information

### 3. Loan Applications

#### Application Status Tracking
```sql
-- Get all loan applications for a client
SELECT 
    id, application_number, loan_type, 
    requested_amount, approved_amount,
    application_status, created_at, updated_at
FROM loan_applications 
WHERE client_id = $1 
ORDER BY created_at DESC;
```

#### Status Values
- `draft` → `submitted` → `under_review` → `approved`/`rejected`
- **Application Number Format**: `APP-YYYY-XXXXXX`
- **Loan Types**: `mortgage`, `credit`, `refinance_mortgage`, `refinance_credit`, `personal_loan`

### 4. Bank Configuration

#### Bank-Specific Parameters
```sql
-- Get bank configuration for calculations
SELECT 
    b.bank_name, b.bank_code,
    bs.parameter_name, bs.parameter_value
FROM banks b
JOIN banking_standards bs ON b.id = bs.bank_id
WHERE b.is_active = true
ORDER BY b.bank_name, bs.parameter_name;
```

#### Global Calculation Parameters
```sql
-- System-wide loan calculation parameters
SELECT parameter_name, parameter_value, parameter_type
FROM calculation_parameters
WHERE is_active = true
ORDER BY parameter_name;
```

## Translation System (Critical for Multi-Language Apps)

### Content Structure
- **content_items**: Master content definitions
- **content_translations**: Multi-language translations

### Get Translated Content

#### For Specific Screen and Language
```sql
SELECT 
    ci.content_key,
    ci.component_type,
    ci.category,
    ct.content_value,
    ct.language_code
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = $1  -- e.g., 'calculate_mortgage_1'
    AND ct.language_code = $2   -- 'en', 'he', or 'ru'
    AND ct.status = 'approved'
    AND ci.is_active = true
ORDER BY ci.content_key;
```

#### With English Fallback
```sql
-- Get translation with fallback to English
SELECT 
    ci.content_key,
    COALESCE(
        (SELECT content_value FROM content_translations 
         WHERE content_item_id = ci.id AND language_code = $2 AND status = 'approved'),
        (SELECT content_value FROM content_translations 
         WHERE content_item_id = ci.id AND language_code = 'en' AND status = 'approved')
    ) as content_value,
    COALESCE(
        (SELECT language_code FROM content_translations 
         WHERE content_item_id = ci.id AND language_code = $2 AND status = 'approved'),
        'en'
    ) as actual_language
FROM content_items ci
WHERE ci.content_key = $1 AND ci.is_active = true;
```

### Translation Key Patterns
```
[feature]_[field]_[type]
├── calculate_mortgage_property_ownership         (dropdown title)
├── calculate_mortgage_property_ownership_ph      (placeholder)
├── calculate_mortgage_property_ownership_option_1 (dropdown option)
├── calculate_credit_target_option_2              (credit dropdown)
└── personal_cabinet_income_source_ph             (form placeholder)
```

### Supported Languages
- **en**: English (primary/fallback)
- **he**: Hebrew (RTL support)
- **ru**: Russian

## REST API Endpoints (Alternative to Direct DB Access)

If direct database access is not preferred, the application provides REST endpoints:

### Content API
```bash
# Get all content for a screen in specific language
GET /api/content/{screen}/{language}

# Get specific content item with fallback
GET /api/content/{key}/{language}

# Examples
GET /api/content/calculate_mortgage_1/en
GET /api/content/calculate_mortgage_property_ownership/he
```

### Health Checks
```bash
# Main database health
GET /api/health

# Content database health  
GET /api/content/health
```

## Important Data Constraints

### Financial Validation Rules
- **Credit Score**: 300-850 range
- **LTV Ratios**: 0-100% (property value percentage)
- **DTI Ratios**: 0-100% (debt-to-income percentage)
- **Monetary Values**: Non-negative only

### Translation Status
- Only `status = 'approved'` translations should be used
- Always provide English fallback for missing translations
- `is_active = true` for content items only

### Date Handling
- All timestamps in UTC
- `created_at` and `updated_at` auto-maintained
- Session expiration checks required

## Security Considerations

### Authentication Required
- All sensitive financial data requires valid session token
- Session expiration must be checked: `expires_at > NOW()`
- Different auth flows: SMS (clients) vs Email (staff)

### Data Access Permissions
- **clients**: Can only access their own data
- **users**: Staff access based on role permissions
- **Banking data**: Aggregated data only, no individual client PII

### Connection Security
- Use SSL/TLS for all database connections
- Implement connection pooling for performance
- Parameterized queries only (prevent SQL injection)

## Performance Recommendations

### Indexes Available
- **Users**: `idx_users_email`
- **Sessions**: `idx_sessions_token`, `idx_sessions_expires_at`
- **Applications**: `idx_loan_applications_client_id`, `idx_loan_applications_status`
- **Content**: `idx_content_items_screen_location`, `idx_content_translations_language`

### Efficient Query Patterns
```sql
-- Good: Use indexes
SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW();

-- Good: Join with proper foreign keys
SELECT c.name, la.loan_type FROM clients c 
JOIN loan_applications la ON c.id = la.client_id;

-- Avoid: Full table scans
SELECT * FROM clients WHERE name LIKE '%john%';
```

### Connection Pooling
Implement connection pooling with:
- **Max connections**: 10-20 per pool
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

## Example Integration Code

### Node.js with pg
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Get client profile
async function getClientProfile(clientId) {
    const query = `
        SELECT c.id, c.name, c.phone, ch.credit_score, ce.monthly_income
        FROM clients c
        LEFT JOIN client_credit_history ch ON c.id = ch.client_id
        LEFT JOIN client_employment ce ON c.id = ce.client_id
        WHERE c.id = $1
    `;
    const result = await pool.query(query, [clientId]);
    return result.rows[0];
}

// Get translations
async function getTranslations(screenLocation, language = 'en') {
    const query = `
        SELECT ci.content_key, ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1 
            AND ct.language_code = $2 
            AND ct.status = 'approved'
    `;
    const result = await pool.query(query, [screenLocation, language]);
    return result.rows.reduce((acc, row) => {
        acc[row.content_key] = row.content_value;
        return acc;
    }, {});
}
```

### Python with psycopg2
```python
import psycopg2
from psycopg2 import pool

# Connection pool
connection_pool = psycopg2.pool.ThreadedConnectionPool(
    1, 10,
    "postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"
)

def get_translations(screen_location, language='en'):
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ci.content_key, ct.content_value
                FROM content_items ci
                JOIN content_translations ct ON ci.id = ct.content_item_id
                WHERE ci.screen_location = %s 
                    AND ct.language_code = %s 
                    AND ct.status = 'approved'
            """, (screen_location, language))
            
            return {row[0]: row[1] for row in cur.fetchall()}
    finally:
        connection_pool.putconn(conn)
```

---

**Last Updated**: January 21, 2025  
**Database Type**: PostgreSQL 14+ (Railway Cloud)  
**Supported Languages**: English, Hebrew, Russian  
**Authentication**: JWT with session expiration