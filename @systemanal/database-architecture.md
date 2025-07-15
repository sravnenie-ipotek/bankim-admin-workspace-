# Database Architecture

## Three-Database Architecture Conclusion

Based on our analysis, the BankIM system should implement a **3-database architecture** for optimal separation of concerns, security, and scalability:

### 1. **BankIM Online Database**
- **Purpose**: Core banking operations
- **Contents**: Customer accounts, transactions, financial data, trading operations
- **Access**: 
  - BankIM Online App: Full read/write access
  - Management Portal: Read-only access for monitoring and reports

### 2. **Management Portal Database**
- **Purpose**: Administrative and operational management
- **Contents**: 
  - User roles and permissions (6 role types)
  - Audit logs and action history
  - System configurations
  - Operational metrics and analytics
  - Admin user profiles and sessions
- **Access**: 
  - Management Portal: Full read/write access
  - BankIM Online App: No access

### 3. **Content Database**
- **Purpose**: Dynamic content management system
- **Contents**:
  - UI translations (multi-language support)
  - Announcements and notifications
  - Help articles and documentation
  - Marketing content
  - Terms and conditions
  - Dynamic UI labels and messages
- **Access**:
  - Management Portal: Full read/write access (content editing)
  - BankIM Online App: Read-only access (content consumption)

## Implementation Architecture

### Microservices Pattern with API Gateway

```
┌─────────────────────┐         ┌─────────────────────┐
│  Management Portal  │         │  BankIM Online App  │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           ▼                               ▼
    ┌──────────────────────────────────────────────┐
    │              API Gateway                      │
    │  (Authentication, Rate Limiting, Routing)     │
    └──────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Management  │ │   Banking   │ │   Content   │
    │     API     │ │     API     │ │     API     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │              │              │
           ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Management  │ │   BankIM    │ │   Content   │
    │   Database  │ │   Online    │ │  Database   │
    │             │ │  Database   │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### Access Control Matrix

| Application | Management DB | BankIM Online DB | Content DB |
|------------|---------------|------------------|------------|
| Management Portal | Read/Write | Read-Only | Read/Write |
| BankIM Online App | No Access | Read/Write | Read-Only |

### Key Benefits

1. **Security**
   - Isolated databases prevent unauthorized cross-access
   - Management data never exposed to banking app
   - Content changes controlled through management portal only

2. **Scalability**
   - Each database can be scaled independently
   - Content DB can use read replicas for banking app
   - Separate connection pools for each service

3. **Maintainability**
   - Clear separation of concerns
   - Independent deployment of services
   - Easier troubleshooting and monitoring

4. **Performance**
   - Optimized database schemas for specific use cases
   - Efficient caching strategies per database
   - Reduced lock contention

### Implementation Recommendations

1. **API Design**
   - RESTful APIs for standard operations
   - GraphQL for complex content queries
   - WebSockets for real-time content updates

2. **Authentication**
   - JWT tokens with role-based claims
   - Different token issuers per application
   - API Gateway validates all requests

3. **Content Service Features**
   - Version control for all content changes
   - Draft/Published states
   - Scheduled publishing
   - Bulk translation management

4. **Monitoring**
   - Separate monitoring per database
   - API performance metrics
   - Content cache hit rates

This architecture ensures proper data isolation while maintaining the flexibility needed for a modern banking management system.