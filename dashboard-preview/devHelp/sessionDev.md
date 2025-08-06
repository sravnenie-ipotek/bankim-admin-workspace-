# Session-Based Authentication & Audit Logging Implementation

## Overview
Implement comprehensive user tracking and audit logging for all content changes in the BankIM content management portal. Replace mock authentication with real session-based user management.

## 1. Install Backend Dependencies

**What we do:**
- Add express-session for session management middleware
- Add connect-pg-simple to store sessions in PostgreSQL database
- Add bcrypt for secure password hashing

**Why we do this:**
- Express needs session middleware to track logged-in users across requests
- Sessions must persist in database (not memory) for production reliability
- Passwords must be hashed securely, never stored as plain text
- Enables tracking of user identity for all content operations

```bash
cd backend/
npm install express-session connect-pg-simple bcrypt
```

## 2. Create Database Tables

**What we do:**
- Execute database/session-audit-tables.sql to create new tables
- Create session table for PostgreSQL session storage
- Create admin_users table with secure password management
- Create content_audit_log table for tracking all content changes
- Create login_audit_log table for security monitoring

**Why we do this:**
- session table: Required by connect-pg-simple to store user sessions
- admin_users table: Store real admin accounts instead of frontend-only mock users
- content_audit_log table: Complete audit trail of who changed what content when
- login_audit_log table: Security monitoring and compliance tracking
- All tables need proper indexes for performance and foreign keys for data integrity

## 3. Integrate Authentication with Main Server

**What we do:**
- Import authentication middleware into backend/server.js
- Add session middleware configuration with PostgreSQL store
- Add authentication routes (/api/auth/login, /api/auth/logout, /api/auth/me)
- Configure session cookies and security settings
- Add IP address and user agent tracking

**Why we do this:**
- Server currently has no concept of logged-in users
- Sessions enable persistent user identity across page refreshes
- Login/logout endpoints replace frontend-only authentication
- Security headers and IP tracking for audit compliance
- Foundation for protecting content modification endpoints

## 4. Enhance Content Update Endpoints with Logging

**What we do:**
- Modify PUT /api/content-items/:id/translations/:lang endpoint
- Add optionalAuth middleware to capture user context
- Query old content value before updating (for audit comparison)
- Insert audit log record after successful content update
- Capture complete change context: user, content, timestamp, source

**Why we do this:**
- Currently no record exists of who makes content changes
- Audit logs required for compliance and security monitoring
- Old value comparison enables rollback capabilities
- User context from session provides accountability
- Source page and user agent help with troubleshooting and security

## 5. Update Frontend Authentication

**What we do:**
- Replace mock login in AuthContext.tsx with real API calls
- Connect to /api/auth/login endpoint with credentials
- Handle session persistence across page refreshes
- Update logout to call /api/auth/logout endpoint
- Add session validation on app startup

**Why we do this:**
- Frontend currently uses fake authentication that doesn't persist
- Real authentication enables user tracking across all operations
- Session cookies maintain login state without storing passwords
- Proper logout ensures sessions are destroyed securely
- User context needed for audit logging throughout application

## 6. Implement Audit Log Viewer

**What we do:**
- Create new admin page at /admin/audit-logs
- Display table of all content changes with user information
- Add filtering by user, date range, content type, action type
- Show old value → new value comparison for each change
- Add export functionality for compliance reporting

**Why we do this:**
- Administrators need visibility into all content changes
- Audit trails required for regulatory compliance
- Change history helps troubleshoot content issues
- User activity monitoring for security purposes
- Export capability for external audit requirements

## End Result: Complete Audit Trail

**When "Save Changes" button is pressed anywhere in the system, we capture:**

### Multiple Save Button Locations:
- **Menu Edit Page**: `/content/menu/edit/{id}` - Menu item translations
- **Mortgage Edit Page**: `/content/mortgage/edit/{id}` - Mortgage content translations  
- **Mortgage Refi Edit Page**: `/content/mortgage-refi/edit/{id}` - Refinancing content translations
- **Credit Edit Page**: `/content/credit/edit/{id}` - Credit content translations
- **General Edit Page**: `/content/general/edit/{id}` - General page content translations
- **Any future edit pages** - System automatically captures all content changes

### Complete Change Context Captured:
- **User identity**: ID, email, name, role from authenticated session
- **Content details**: Item ID, content key, screen location, language
- **Change information**: Complete old value and new value comparison
- **Source location**: Exact edit page URL where change was made (e.g., `/content/mortgage/edit/38`)
- **Session context**: Session ID for user journey tracking
- **Request metadata**: IP address, user agent, referer URL, timestamp
- **Action classification**: CREATE, UPDATE, or DELETE operation
- **Field identification**: Which specific field was changed (content_value, status, etc.)

### Audit Log Display Example:
```
Timestamp: 2024-01-15 14:30:25
User: admin@bankim.co.il (System Administrator)
Source Page: /content/mortgage/edit/38
Content: mortgage_calculation.field.bank_name (Russian)
Action: UPDATE
Old Value: "Банк-кредитор"
New Value: "Банк кредитор (обновлено)"
Session: sess_abc123xyz
IP: 192.168.1.100
```

This enables administrators to see exactly:
- **WHO** made the change (full user details)
- **WHERE** the change was made (specific edit page)
- **WHAT** was changed (exact content field and values)
- **WHEN** it happened (precise timestamp)
- **HOW** it was accessed (session, IP, browser)

**Security and Compliance Benefits:**
- Complete accountability for all content modifications
- Tamper-evident audit trail stored in database
- Login attempt monitoring for security analysis
- Session-based authentication prevents credential storage
- IP address tracking for geographic security monitoring

**Business Benefits:**
- Identify who made specific content changes
- Rollback capability using old value storage
- Quality control through change visibility
- Compliance with data protection regulations
- Management reporting on content activity
