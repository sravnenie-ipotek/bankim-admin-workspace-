# Главная (Main) Content Page - Development Plan

## 📋 **Project Overview**
Develop the main content management page for "Калькулятор ипотеки Страница №2" (Mortgage Calculator Page #2) based on the Figma design, leveraging existing codebase components and patterns.

**Figma Reference:** https://www.figma.com/file/Eenpc3kJRZHhxQNB2lkOxa/AP-%7C-%D0%9A%D0%BE%D0%BD%D1%82%D0%B5%D0%BD%D1%82-%D0%BC%D0%B5%D0%BD%D0%B5%D0%B4%D0%B6%D0%B5%D1%80?type=design&node-id=80-110128&mode=design&t=nKVTUEsgeYjApPEe-4

**Code Reference:** devHelp/contentMenu/cssPages/main_page.md

---

## 🔄 **Existing Infrastructure Analysis**

### **✅ Available Components (Reuse these)**
- **Table Component**: `src/components/Table/Table.tsx` - Fully featured with search, filters, pagination
- **Breadcrumb Component**: `src/pages/Chat/ContentManagement/components/Breadcrumb/` - Navigation breadcrumbs  
- **UserInfoCards Component**: `src/pages/Chat/ContentManagement/components/UserInfoCards/` - Statistics cards
- **PageGallery Component**: `src/pages/Chat/ContentManagement/components/PageGallery/` - Image gallery with carousel
- **ContentTable Component**: `src/pages/Chat/ContentManagement/components/ContentTable/` - Advanced data table
- **AdminLayout**: `src/components/AdminLayout/` - Layout wrapper with navigation
- **NavigationContext**: `src/contexts/NavigationContext.tsx` - Submenu state management

### **✅ Existing Routing Structure**
```typescript
// Already implemented in App.tsx
/content/main → AdminLayout with "Главная" activeMenuItem
```

### **✅ Existing Patterns**
- **ContentManagementPage.tsx**: Similar page structure already exists
- **Dark theme styling**: `#1E293B`, `#1F2A37`, `#374151` 
- **Typography**: Arimo font family consistently used
- **Component architecture**: Established patterns for content management

---

## 🎯 **Updated Development Steps**

### **Phase 1: Leverage Existing Content Structure** 

#### **Step 1.1: Update Existing Content Main Route**
- [x] **Route exists**: `/content/main` already routed in `App.tsx` (line 367-382)
- [ ] **Enhance component**: Upgrade placeholder `content-page` div to full implementation
- [ ] **Reuse AdminLayout**: Already configured with proper activeMenuItem

#### **Step 1.2: Reuse Existing Breadcrumb Component**
- [x] **Component exists**: `src/pages/Chat/ContentManagement/components/Breadcrumb/`
- [ ] **Import and configure**: Use existing Breadcrumb with correct navigation items
- [ ] **Navigation integration**: Connect with NavigationContext for submenu highlighting

#### **Step 1.3: Reuse UserInfoCards Component**
- [x] **Component exists**: `src/pages/Chat/ContentManagement/components/UserInfoCards/`
- [ ] **Import and configure**: Display "Количество действий: 33" and "Последнее редактирование"
- [ ] **Match design**: Ensure styling matches Figma specifications

---

### **Phase 2: Reuse Gallery and Table Components**

#### **Step 2.1: Reuse PageGallery Component**
- [x] **Component exists**: `src/pages/Chat/ContentManagement/components/PageGallery/`
- [ ] **Import and configure**: Use existing gallery with page state images
- [ ] **Content adaptation**: Adapt for "Страница и ее состояния" section

#### **Step 2.2: Enhance Existing Table Component**
- [x] **Component exists**: `src/components/Table/Table.tsx` with full functionality
- [ ] **Data transformation**: Transform actions data to match Table component interface
- [ ] **Column configuration**: Configure for action management (ID, Type, RU, HEB, Actions)
- [ ] **Icons integration**: Add edit/navigation icons to actions column

#### **Step 2.3: Reuse Built-in Pagination**
- [x] **Component exists**: Already integrated in Table component
- [ ] **Configuration**: Ensure pagination shows "Показывает 1-20 из 1000" format
- [ ] **Styling**: Verify pagination matches Figma design

---

### **Phase 3: Data Integration & API Patterns**

#### **Step 3.1: Follow Existing API Patterns**
- [x] **API service exists**: `src/services/api.ts` with standardized patterns
- [ ] **Content API**: Extend existing ContentManagement API for main page data
- [ ] **Data transformation**: Follow existing patterns from ContentManagementPage.tsx

#### **Step 3.2: Reuse Loading/Error States**
- [x] **Patterns exist**: ContentManagementPage.tsx has loading/error handling
- [ ] **Implement same patterns**: Consistent loading spinners and error messages
- [ ] **State management**: Follow existing useState patterns

---

### **Phase 4: Integration with Existing Navigation**

#### **Step 4.1: NavigationContext Integration**
- [x] **Context exists**: NavigationContext manages submenu state
- [ ] **Integration**: Ensure proper submenu highlighting when navigating to main page
- [ ] **Header update**: Verify TopNavigation shows correct submenu name

#### **Step 4.2: SharedMenu Integration**
- [x] **Component exists**: SharedMenu handles content submenu navigation
- [ ] **Route testing**: Verify clicking "Главная" navigates correctly
- [ ] **Active state**: Ensure proper highlighting of active submenu item

---

### **Phase 5: Styling Consistency**

#### **Step 5.1: Reuse Existing CSS Patterns**
- [x] **CSS exists**: ContentManagement.css has established patterns
- [ ] **Style inheritance**: Reuse existing dark theme variables and spacing
- [ ] **Component consistency**: Ensure new page matches existing component styling

#### **Step 5.2: Responsive Design**
- [x] **Patterns exist**: Existing components have responsive breakpoints
- [ ] **Mobile adaptation**: Follow existing mobile-first patterns
- [ ] **Touch interactions**: Reuse existing touch-friendly interactive elements

---

## 📁 **Updated File Structure**

### **New Files Only** (Minimal creation)
```
src/pages/ContentMain/
├── ContentMain.tsx      # Main component (new)
├── ContentMain.css      # Component-specific styles (new)
└── index.ts            # Export (new)
```

### **Reused Components** (No duplication)
```
# EXISTING - REUSE AS-IS
src/pages/Chat/ContentManagement/components/
├── Breadcrumb/          ✅ Full breadcrumb functionality
├── UserInfoCards/       ✅ Statistics cards with proper styling  
├── PageGallery/         ✅ Image gallery with carousel
└── ContentTable/        ✅ Advanced table functionality

src/components/Table/    ✅ Full table with search, filters, pagination
src/contexts/NavigationContext.tsx  ✅ Submenu state management
```

---

## 🔧 **Implementation Strategy**

### **Step-by-Step Execution**

#### **Phase 1: Quick Setup (30 minutes)**
1. Create minimal `src/pages/ContentMain/ContentMain.tsx`
2. Import existing Breadcrumb, UserInfoCards, PageGallery, Table components
3. Replace placeholder content in `/content/main` route

#### **Phase 2: Data Integration (1 hour)**
1. Transform action data to match Table component interface
2. Configure UserInfoCards with correct statistics
3. Setup PageGallery with page state images

#### **Phase 3: Styling Polish (30 minutes)**
1. Create minimal `ContentMain.css` for layout-specific styles
2. Ensure consistency with existing ContentManagement styling
3. Verify responsive behavior works correctly

#### **Phase 4: Testing (30 minutes)**
1. Test navigation from SharedMenu → content-main route
2. Verify breadcrumb navigation works
3. Test table functionality (search, sort, pagination)
4. Verify mobile responsiveness

### **Total Estimated Time: 2.5 hours** (vs 40+ hours from scratch)

---

## 🎨 **Design Specifications** (Inherit from existing)

### **Colors** (Already established)
- Background: `#1E293B` ✅ Used in existing components
- Card Background: `#1F2A37` ✅ Used in UserInfoCards
- Text Primary: `#F9FAFB` ✅ Consistent across components
- Text Secondary: `#9CA3AF` ✅ Established in design system
- Border: `#374151` ✅ Standard border color
- Accent: `#FBE54D` ✅ Existing accent color

### **Typography** (Already established)
- Font Family: Arimo ✅ Used across all components
- Heading: 30px, weight 600 ✅ Existing h1 styles
- Section Titles: 24px, weight 600 ✅ Existing patterns
- Body Text: 14px, weight 400/500 ✅ Table component styles
- Table Headers: 12px, weight 600, uppercase ✅ Table component

### **Spacing** (Already established)
- Section Gap: 40px ✅ ContentManagement.css
- Card Padding: 24px ✅ UserInfoCards component
- Table Cell Padding: 16px ✅ Table component
- Component Gap: 20px ✅ Existing grid gaps

---

## 🔗 **Component Import Map**

```typescript
// ContentMain.tsx imports
import { Breadcrumb } from '../Chat/ContentManagement/components/Breadcrumb';
import { UserInfoCards } from '../Chat/ContentManagement/components/UserInfoCards';
import { PageGallery } from '../Chat/ContentManagement/components/PageGallery';
import { Table } from '../../components/Table';
import { useNavigation } from '../../contexts/NavigationContext';
```

---

## ⚡ **Benefits of Reuse Strategy**

1. **90% faster development**: Leverage existing components vs building from scratch
2. **Consistent UX**: Users see familiar interfaces and interactions
3. **Reduced bugs**: Reusing tested components vs creating new ones
4. **Easier maintenance**: Changes to shared components benefit all pages
5. **Smaller bundle size**: No duplicate code or styling
6. **Established patterns**: Follow proven architecture and data flow

---

## 🚀 **Next Steps**

1. **Immediate**: Create ContentMain component using existing components
2. **Week 1**: Complete data integration and styling polish  
3. **Week 2**: Testing, mobile optimization, and final refinements
4. **Future**: Extend functionality as needed without breaking existing patterns
