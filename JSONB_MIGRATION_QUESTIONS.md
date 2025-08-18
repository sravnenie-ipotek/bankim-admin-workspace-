# 🚨 Critical Questions for BankIM Development Team - JSONB Migration

**Date**: January 2025  
**Priority**: URGENT - Required before implementation  
**Context**: Admin panel needs to migrate to JSONB dropdown system

---

## 🏗️ Architecture & Infrastructure Questions

### 1. **Database Synchronization**
- **Q1.1**: Does the admin panel share the same database as the main BankIM application, or does it use a separate database?
- **Q1.2**: If separate, how should synchronization work between the main app's `dropdown_configs` table and the admin panel?
- **Q1.3**: Is there a read-replica setup we should be aware of?

### 2. **Migration Status**
- **Q2.1**: Is the JSONB migration already live in production for the main application?
- **Q2.2**: Are there any dropdowns still using the old `content_items` system in production?
- **Q2.3**: What's the current state of the `dropdown_configs` table - fully populated or partially migrated?

### 3. **Database Access**
- **Q3.1**: Which database should the admin panel connect to for JSONB dropdowns:
  - `CONTENT_DATABASE_URL` (current)
  - `CORE_DATABASE_URL`
  - `MANAGEMENT_DATABASE_URL`
  - Or a new connection string?
- **Q3.2**: Do we have write permissions to the `dropdown_configs` table from the admin panel?

---

## 🔌 API & Integration Questions

### 4. **Existing JSONB Endpoints**
- **Q4.1**: Are the JSONB endpoints mentioned in the report (`/api/dropdowns/{screen}/{language}`) already implemented in the main app?
- **Q4.2**: Should the admin panel use these existing endpoints or create its own?
- **Q4.3**: Is there an authentication layer we need to consider when accessing these endpoints?

### 5. **Admin-Specific Endpoints**
- **Q5.1**: Should we create separate admin endpoints for JSONB management (e.g., `/api/admin/dropdown-configs/`)?
- **Q5.2**: Or should we extend the existing endpoints with admin capabilities?
- **Q5.3**: Are there any rate limiting or permission considerations for admin operations?

---

## 💾 Data & Content Questions

### 6. **Content Types**
- **Q6.1**: The report focuses on dropdowns, but what about other content types (text, links, steps)?
- **Q6.2**: Should we maintain a hybrid approach where dropdowns use JSONB but other content uses the old system?
- **Q6.3**: Is there a plan to migrate ALL content types to JSONB eventually?

### 7. **Screen Identifiers**
- **Q7.1**: Can you provide a complete list of all `screen_location` values that need migration?
- **Q7.2**: Are the screen identifiers consistent between the main app and admin panel?
- **Q7.3**: How do we handle new screens that might be added during migration?

### 8. **Language Support**
- **Q8.1**: The report shows 3 languages (en, he, ru). Are there plans to add more languages?
- **Q8.2**: How should the system handle missing translations - fallback to English or show an error?
- **Q8.3**: Should all three languages be mandatory when creating/editing dropdowns?

---

## 🔄 Migration & Rollback Questions

### 9. **Migration Strategy**
- **Q9.1**: Should we run a one-time migration script or implement a gradual migration?
- **Q9.2**: How do we handle dropdowns that are edited in the old system after JSONB migration starts?
- **Q9.3**: Is there a specific order in which screens should be migrated?

### 10. **Rollback Plan**
- **Q10.1**: If something goes wrong, can we rollback to the old system?
- **Q10.2**: Should we maintain both systems in parallel during transition?
- **Q10.3**: How long should we keep the old data as backup?

### 11. **Feature Flags**
- **Q11.1**: Is there an existing feature flag system in place?
- **Q11.2**: Should we implement `USE_JSONB_ADMIN=true` as suggested, or use a different mechanism?
- **Q11.3**: How do we coordinate feature flag activation between main app and admin panel?

---

## 🧪 Testing & Validation Questions

### 12. **Testing Environment**
- **Q12.1**: Is there a staging environment with JSONB structure already set up?
- **Q12.2**: Can we get access to test data that matches production structure?
- **Q12.3**: Are there existing test cases we should be aware of?

### 13. **Validation Rules**
- **Q13.1**: What validation rules should be applied to JSONB data?
- **Q13.2**: Are there any business rules about dropdown options (min/max count, value formats)?
- **Q13.3**: Should we validate that all dropdown values match any existing business logic?

---

## ⚡ Performance & Caching Questions

### 14. **Caching Strategy**
- **Q14.1**: Is Redis already configured for the admin panel?
- **Q14.2**: Should cache invalidation be automatic or manual after edits?
- **Q14.3**: How should cache keys be structured for JSONB data?

### 15. **Performance Requirements**
- **Q15.1**: What are the acceptable response times for dropdown operations?
- **Q15.2**: Is the 100ms target mentioned in the report a hard requirement?
- **Q15.3**: Should we implement pagination for large dropdown lists?

---

## 🔐 Security & Permissions Questions

### 16. **Access Control**
- **Q16.1**: Are there role-based permissions for editing different types of dropdowns?
- **Q16.2**: Should certain dropdowns be read-only for some admin users?
- **Q16.3**: How do we audit who made changes to dropdown configurations?

### 17. **Data Integrity**
- **Q17.1**: Should we implement version control for JSONB changes?
- **Q17.2**: How do we prevent concurrent editing conflicts?
- **Q17.3**: Should there be an approval workflow for dropdown changes?

---

## 📊 Monitoring & Support Questions

### 18. **Monitoring**
- **Q18.1**: What monitoring tools are in place (DataDog, Sentry as mentioned)?
- **Q18.2**: What metrics should we track for JSONB operations?
- **Q18.3**: How do we alert on migration issues?

### 19. **Documentation**
- **Q19.1**: Where should we document the new JSONB admin interface?
- **Q19.2**: Are there existing API docs that need updating?
- **Q19.3**: Who needs to be trained on the new system?

---

## 🚀 Implementation Timeline Questions

### 20. **Priority & Deadlines**
- **Q20.1**: What's the deadline for completing this migration?
- **Q20.2**: Which features are must-have vs nice-to-have?
- **Q20.3**: Should we implement everything at once or in phases?

### 21. **Dependencies**
- **Q21.1**: Are there other teams/systems that depend on the admin panel's dropdown management?
- **Q21.2**: Do we need to coordinate with any other migration efforts?
- **Q21.3**: Are there any upcoming changes to the main app that might affect this migration?

---

## 📝 Specific Technical Questions

### 22. **JSONB Structure Details**
- **Q22.1**: The report shows `dropdown_key` as `screen_field` format. Is this a strict requirement?
- **Q22.2**: Can the JSONB structure be extended with custom fields in the future?
- **Q22.3**: How do we handle nested or hierarchical dropdown relationships?

### 23. **Business Logic**
- **Q23.1**: Are there any calculated or dynamic dropdown values?
- **Q23.2**: Do some dropdowns depend on other dropdown selections?
- **Q23.3**: Are there any dropdown values that trigger specific business logic?

### 24. **Import/Export**
- **Q24.1**: Should we provide import/export functionality for dropdown configurations?
- **Q24.2**: Is there a need to sync dropdown data with external systems?
- **Q24.3**: How do we handle bulk updates to multiple dropdowns?

---

## ✅ Action Items After Answers

Once these questions are answered, we'll need to:

1. **Create detailed technical specification** based on responses
2. **Set up development environment** with proper database access
3. **Build migration scripts** with safety checks
4. **Implement JSONB endpoints** in the admin panel
5. **Update React components** for JSONB editing
6. **Create comprehensive test suite**
7. **Document the new workflow** for content managers
8. **Plan gradual rollout** with monitoring

---

## 🆘 Points of Contact Needed

Please provide contact information for:
- **Database Administrator** - for schema and access questions
- **Main App Development Lead** - for integration questions
- **DevOps Team** - for deployment and monitoring
- **Product Owner** - for business requirements and priorities
- **QA Lead** - for testing strategy and validation

---

**Please review these questions and provide answers or direct us to the appropriate team members who can help. This information is critical for successful implementation of the JSONB migration in the admin panel.**