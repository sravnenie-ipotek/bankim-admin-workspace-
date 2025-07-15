# Calculator Formula Implementation

## Overview
**Page 11: Формула калькулятора. Директор. Стр.11 . Действий 15**

Complete implementation of the Calculator Formula configuration page for the BankIM Management Portal Director role. This page allows directors to view and modify the calculator formula that determines mortgage and credit programs shown to clients before registration.

## 🎯 Business Requirements
Based on Confluence specification: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/149127289/

### Key Functionality
- **Formula Configuration**: Manage calculator parameters that affect client-facing program offerings
- **View/Edit Modes**: Toggle between read-only display and editable form
- **Validation**: Strict numeric validation (numbers and dots only) with business logic rules
- **Multi-language Support**: Admin CMS-ready structure for text management
- **Responsive Design**: Mobile, tablet, and desktop compatibility

## ✅ Implementation Status: COMPLETE

### All 15 Actions Implemented

| Action | Component | Status | Description |
|--------|-----------|--------|-------------|
| 1 | Side Navigation | ✅ | Integrated with AdminLayout |
| 2 | Top Navigation | ✅ | Notifications, language, profile |
| 3 | Page Title | ✅ | "Формула калькулятора" |
| 4 | Edit Button | ✅ | Toggle edit mode functionality |
| 5 | Program Duration Section | ✅ | "Срок программы" |
| 6 | Min Term Input | ✅ | Minimum term (months) |
| 7 | Max Term Input | ✅ | Maximum term (months) |
| 8 | Financing Section | ✅ | "Финансирование" |
| 9 | Financing Percentage | ✅ | Financing percentage (%) |
| 10 | Interest Rate Section | ✅ | "Процент" |
| 11 | Bank Interest Rate | ✅ | Bank rate input |
| 12 | Base Interest Rate | ✅ | Base rate input |
| 13 | Variable Interest Rate | ✅ | Variable rate input |
| 14 | Interest Change Period | ✅ | Change period (months) |
| 15 | Inflation Index | ✅ | Inflation index (%) |

## 🛠 Technical Implementation

### Frontend Architecture
```
src/pages/CalculatorFormula.tsx
src/pages/CalculatorFormula.css
src/services/api.ts (centralized API calls)
```

### Backend Architecture
```
server/server.js (API endpoints)
server/database.js (database operations)
calculator_formula table (SQLite)
```

### Key Features

#### 1. State Management
- **View Mode**: Display current formula values
- **Edit Mode**: Editable inputs with real-time validation
- **Loading States**: User feedback during API operations
- **Error Handling**: Validation and API error management

#### 2. Validation System
```typescript
// Numeric validation (numbers and dots only)
const numericPattern = /^[0-9.]+$/;

// Business logic validation
if (parseFloat(minTerm) >= parseFloat(maxTerm)) {
  errors.maxTerm = 'Максимальный срок должен быть больше минимального';
}
```

#### 3. API Integration
- **GET** `/api/calculator-formula` - Load current formula
- **PUT** `/api/calculator-formula` - Update formula
- Centralized API service with TypeScript types
- Error handling and loading states

#### 4. Database Schema
```sql
CREATE TABLE calculator_formula (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  min_term TEXT NOT NULL,
  max_term TEXT NOT NULL,
  financing_percentage TEXT NOT NULL,
  bank_interest_rate TEXT NOT NULL,
  base_interest_rate TEXT NOT NULL,
  variable_interest_rate TEXT NOT NULL,
  interest_change_period TEXT NOT NULL,
  inflation_index TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Design Implementation

### Visual Specifications
- **Design System**: Matches existing admin panel design
- **Colors**: Professional gray/blue palette with #FBE54D accents
- **Typography**: Arimo font family, consistent sizing
- **Layout**: Grid-based responsive layout
- **Interactions**: Hover effects, focus states, loading indicators

### Responsive Breakpoints
- **Desktop**: > 768px (full grid layout)
- **Tablet**: 768px (single column)
- **Mobile**: < 480px (optimized spacing)

### Accessibility Features
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Tab order and Enter/Space handling
- **High contrast**: Enhanced borders for accessibility
- **Reduced motion**: Respects user preferences

## 🔗 Integration

### Navigation Integration
- Added to `SharedMenu` as "Формула калькулятора"
- Calculator icon with consistent styling
- Integrated with `AdminLayout` routing

### Route Configuration
```typescript
// src/App.tsx
<Route path="/calculator-formula" element={<CalculatorFormula />} />
```

## 🚀 Usage

### Access the Page
1. Navigate to Director role: `/director`
2. Click "🧮 Формула калькулятора" 
3. Or directly access: `/calculator-formula`

### Edit Formula
1. Click "Редактировать формулу" button
2. Modify values (numbers and dots only)
3. Validation runs in real-time
4. Click "Сохранить изменения" to save
5. Click "Отменить" to cancel

### Default Values
```typescript
{
  minTerm: '12',           // months
  maxTerm: '360',          // months  
  financingPercentage: '80', // %
  bankInterestRate: '3.5',   // %
  baseInterestRate: '2.8',   // %
  variableInterestRate: '1.2', // %
  interestChangePeriod: '12',  // months
  inflationIndex: '2.1'        // %
}
```

## 🔧 Development Notes

### API Service Pattern
Centralized API calls in `src/services/api.ts` for:
- Type safety with TypeScript interfaces
- Consistent error handling
- Environment-based URL configuration
- Reusable across components

### Validation Strategy
- **Frontend**: Real-time validation with user feedback
- **Backend**: Server-side validation with detailed error messages
- **Database**: Constraints and data integrity

### Future Enhancements
1. **Audit Logging**: Track formula changes with user/timestamp
2. **Version History**: Maintain previous formula versions
3. **Approval Workflow**: Require approval for formula changes
4. **Multi-Environment**: Different formulas for staging/production

## 📋 Testing

### Manual Testing Checklist
- [ ] Page loads with current formula data
- [ ] Edit mode toggles correctly
- [ ] All validations work (numeric, required, min < max)
- [ ] Save persists changes to database
- [ ] Cancel discards changes
- [ ] Responsive design works on all devices
- [ ] Navigation integration functions
- [ ] Error states display appropriately

### API Testing
```bash
# Get formula
curl http://localhost:3001/api/calculator-formula

# Update formula
curl -X PUT http://localhost:3001/api/calculator-formula \
  -H "Content-Type: application/json" \
  -d '{"minTerm":"12","maxTerm":"360",...}'
```

## 🏗 Architecture Decisions

### Why Single Formula Record?
- Business requirement: One active formula at a time
- Simplified UX: Edit in place rather than create/select
- Database efficiency: UPDATE vs INSERT for changes

### Why String Storage for Numbers?
- Preserves exact decimal precision
- Handles various number formats consistently
- Validation happens at application layer

### Why Centralized API Service?
- Type safety across components
- Consistent error handling
- Environment configuration
- Easier testing and mocking

---

**Implementation Status**: ✅ COMPLETE  
**Confluence Specification**: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/149127289/  
**All 15 actions implemented with full functionality** 