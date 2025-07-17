# 🔐 BankIM Permission System Documentation

## 📊 Permission Matrix Overview

### **Current Implementation**: Hardcoded in `src/contexts/AuthContext.tsx`

| Role | Total Permissions | Access Level |
|------|------------------|--------------|
| **director** | 13 | Super Admin - Full Access |
| **content-manager** | 5 | Content Management |
| **administration** | 4 | System Administration |
| **sales-manager** | 3 | Sales Operations |
| **bank-employee** | 3 | Banking Operations |
| **brokers** | 2 | Limited Broker Access |

---

## 🌳 Permission Tree Structure

```
📁 BANKIM PERMISSIONS
├── 📊 calculator-formula
│   ├── read (All Roles)
│   ├── write (director)
│   ├── edit (director)
│   └── delete (director)
├── 👥 users
│   └── manage (director, administration)
├── ⚙️ system
│   └── manage (director, administration)
├── 📋 audit-logs
│   └── view (director, administration)
├── 📝 content
│   └── manage (director, content-manager)
├── �� content-management
│   ├── read (director, content-manager)
│   ├── write (director, content-manager)
│   ├── edit (director)
│   └── delete (director)
├── 💼 sales
│   └── manage (director, sales-manager)
├── 🏪 brokers
│   └── manage (director)
├── 👤 clients
│   └── view (sales-manager, bank-employee)
├── 📄 documents
│   └── manage (bank-employee)
├── 🎯 programs
│   └── view (brokers)
└── �� media
    └── manage (content-manager)
```

---

## 📋 Detailed Permission Matrix

| Permission | Resource | director | administration | sales-manager | content-manager | bank-employee | brokers |
|------------|----------|:--------:|:--------------:|:-------------:|:---------------:|:-------------:|:-------:|
| **read** | calculator-formula | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **write** | calculator-formula | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **edit** | calculator-formula | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **delete** | calculator-formula | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **manage** | users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **manage** | system | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **view** | audit-logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **manage** | content | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **read** | content-management | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **write** | content-management | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **edit** | content-management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **delete** | content-management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **manage** | sales | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **manage** | brokers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **view** | clients | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **manage** | documents | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **view** | programs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **manage** | media | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 🎭 Role Breakdown

### 👑 **Director** (Super Admin)
```
📈 Level: Maximum (13 permissions)
🎯 Purpose: Complete system control
📋 Permissions:
  • All calculator-formula operations (read/write/edit/delete)
  • All content-management operations (read/write/edit/delete)
  • User & system management
  • Sales & broker management
  • Audit access
```

### 🎨 **Content Manager**
```
📈 Level: Content Focus (5 permissions)
🎯 Purpose: Website content management
📋 Permissions:
  • calculator-formula (read only)
  • content-management (read/write)
  • content & media management
```

### ⚙️ **Administration**
```
📈 Level: System Admin (4 permissions)
🎯 Purpose: User and system administration
📋 Permissions:
  • calculator-formula (read only)
  • User management
  • System management
  • Audit log access
```

### 💼 **Sales Manager**
```
📈 Level: Sales Operations (3 permissions)
🎯 Purpose: Sales and client management
📋 Permissions:
  • calculator-formula (read only)
  • Sales management
  • Client viewing
```

### 🏦 **Bank Employee**
```
📈 Level: Banking Operations (3 permissions)
🎯 Purpose: Day-to-day banking tasks
📋 Permissions:
  • calculator-formula (read only)
  • Client viewing
  • Document management
```

### 🏪 **Brokers**
```
📈 Level: Limited Access (2 permissions)
🎯 Purpose: Program viewing and calculator access
📋 Permissions:
  • calculator-formula (read only)
  • Program viewing
```

---

## 🔧 Implementation Notes

### **Current Status**: Mock System (Frontend Only)
- **Location**: `src/contexts/AuthContext.tsx`
- **Storage**: Browser localStorage
- **Authentication**: Mock login (no real validation)

### **Production Requirements**:
```sql
-- Database tables needed for real implementation
CREATE TABLE admin_permissions (
    id BIGINT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE admin_user_permissions (
    user_id BIGINT,
    permission_id BIGINT,
    PRIMARY KEY (user_id, permission_id)
);
```

### **API Endpoints Needed**:
```
GET  /api/auth/permissions/{userId}  - Get user permissions
POST /api/auth/login               - Authenticate & get permissions
PUT  /api/admin/permissions/{userId} - Update user permissions
```

---

**📅 Last Updated**: December 2024  
**🔄 Status**: Development/Mock Implementation  
**📍 Next Phase**: Database integration for production
