# Database Configuration for BankIM Management Portal

## Environment-Specific Database Setup

### Development Environment (NODE_ENV=development)
- **Database**: Railway PostgreSQL (remote)
- **Connection**: Via `CONTENT_DATABASE_URL` environment variable
- **SSL**: Disabled (Railway handles security)
- **Usage**: Local development and testing
- **Log identifier**: "Railway (Local Development)"

### Production Environment (NODE_ENV=production)  
- **Database**: Local PostgreSQL on localhost
- **Connection**: `postgresql://postgres:postgres@localhost:5432/bankim_content`
- **SSL**: Disabled (local connection)
- **Usage**: Production server deployment
- **Log identifier**: "Local PostgreSQL database"

## Database Schema

Both environments use the same schema:

### Banks Table
```sql
CREATE TABLE banks (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bank Configurations Table
```sql
CREATE TABLE bank_configurations (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  base_interest_rate DECIMAL(5,3) NOT NULL,
  min_interest_rate DECIMAL(5,3) NOT NULL,
  max_interest_rate DECIMAL(5,3) NOT NULL,
  max_ltv_ratio DECIMAL(5,2) NOT NULL,
  min_credit_score INTEGER NOT NULL,
  max_loan_amount DECIMAL(15,2) NOT NULL,
  min_loan_amount DECIMAL(15,2) NOT NULL,
  processing_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bank_id)
);
```

## Production Environment Variables

For production deployment, set these environment variables:

```bash
NODE_ENV=production
CONTENT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bankim_content
```

## API Endpoints

The Calculator Formula uses these REST API endpoints:

- `GET /api/banks` - Get all active banks
- `GET /api/banks/:bankId/configuration` - Get bank configuration
- `PUT /api/banks/:bankId/configuration` - Update bank configuration

All endpoints automatically detect environment and connect to the appropriate database.

## Connection Handling

- **Development**: Connects to Railway database with existing bank data
- **Production**: Connects to local PostgreSQL with replicated bank data
- **Error Handling**: Proper error responses instead of 404 "Endpoint not found"
- **SSL Configuration**: Disabled for both environments (Railway handles security, localhost doesn't need it)

## Migration

Use `node scripts/setup-banks-tables.js` to set up tables in either environment.
The script automatically detects the environment and connects to the appropriate database.