# BankIM Test Database

## Overview
This is a simple SQLite test database setup for the BankIM Management Portal project.

## Database Details
- **Database Type**: SQLite
- **Database File**: `bankim_test.db`
- **Location**: `/server/bankim_test.db`

## Test Table: `test_users`

### Schema
```sql
CREATE TABLE test_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Sample Data
The database is automatically populated with 5 sample users:
1. John Doe (admin, active)
2. Jane Smith (manager, active) 
3. Bob Johnson (user, inactive)
4. Alice Brown (user, active)
5. Charlie Wilson (manager, pending)

## API Server

### Running the Server
```bash
npm run server
# or
npm run dev:server
# or
node server/server.js
```

### API Endpoints

**Server Status**
- `GET /health` - Health check

**Database Info**
- `GET /api/db-info` - Database information

**Users CRUD**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example API Calls

```bash
# Get all users
curl http://localhost:3001/api/users

# Get specific user
curl http://localhost:3001/api/users/1

# Create new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@bankim.com","role":"user","status":"active"}'

# Update user
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@bankim.com","role":"admin","status":"active"}'

# Delete user
curl -X DELETE http://localhost:3001/api/users/1
```

## Features
- ✅ SQLite database with automatic initialization
- ✅ Full CRUD operations for users
- ✅ Sample data insertion
- ✅ Error handling
- ✅ CORS enabled for frontend integration
- ✅ JSON API responses
- ✅ Input validation

## Files
- `database.js` - Database setup and operations
- `server.js` - Express API server
- `bankim_test.db` - SQLite database file (auto-generated)

## Next Steps
This test database can be extended with:
- Additional tables
- More complex relationships
- Authentication middleware
- Rate limiting
- Logging
- Connection to frontend React components 