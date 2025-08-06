# Shared Dropdown Edit Component - Implementation Instructions

## Overview
Create a shared dropdown edit component that can be used across all content types (mortgage, mortgage-refi, credit, credit-refi, etc.) instead of having separate components for each content type.

## Current State Analysis

### Existing Components:
- `MortgageDropdownEdit` - Custom for mortgage dropdowns
- `MortgageRefiDropdownEdit` - Custom for mortgage-refi dropdowns
- `SharedContentEdit` - Used for credit/credit-refi (but not specifically for dropdowns)

### Common Patterns Found:
- All use similar form structure (title fields + options list)
- All fetch dropdown options via API
- All handle add/delete/reorder options
- All save via individual translation updates
- All have similar UI layout and styling

## Implementation Plan

### Phase 1: Create Shared Component Structure

#### 1.1 Create Base Component
- **Location**: `src/pages/SharedDropdownEdit/SharedDropdownEdit.tsx`
- **Purpose**: Single component that handles all dropdown editing
- **Key Feature**: Content-type configuration system

#### 1.2 Define Core Interfaces
- `DropdownContent` - Content item structure
- `DropdownOption` - Option structure (ru, he, en)
- `ContentTypeConfig` - Configuration per content type
- `SharedDropdownEditProps` - Component props

#### 1.3 Create Configuration System
- **Purpose**: Define behavior per content type
- **Components**: API methods, UI labels, supported languages
- **Location**: `src/utils/dropdownConfigs.ts`

### Phase 2: Content Type Configuration

#### 2.1 Configuration Structure
Each content type needs:
- **Page Title**: "Редактирование дропдауна [content-type]"
- **Active Menu Item**: "content-[content-type]"
- **Breadcrumb Path**: "/content/[content-type]"
- **API Methods**: fetchContent, fetchOptions, saveTitle, saveOptions
- **Supported Languages**: ['ru', 'he', 'en']
- **Features**: optionManagement, optionReordering

#### 2.2 API Method Mapping
- **Mortgage**: Uses `getMortgageDropdownOptions()` and `updateMortgageContent()`
- **Mortgage-Refi**: Uses `getMortgageRefiDropdownOptions()` and individual `updateContentTranslation()`
- **Credit**: Uses `getCreditDropdownOptions()` and `updateCreditContent()`
- **Credit-Refi**: Uses `getCreditRefiDropdownOptions()` and individual `updateContentTranslation()`

### Phase 3: Core Functionality Implementation

#### 3.1 Data Fetching
- **Fetch Content**: Get dropdown item details by actionId
- **Fetch Options**: Get dropdown options by content key
- **Error Handling**: Consistent error messages per content type
- **Loading States**: Show loading spinners during API calls

#### 3.2 Form Management
- **Title Fields**: Russian, Hebrew, English (based on supported languages)
- **Option Management**: Add, delete, reorder options
- **Change Tracking**: Track what has been modified
- **Validation**: Required field validation

#### 3.3 Save Functionality
- **Title Updates**: Update individual translations
- **Option Updates**: Update dropdown options (varies by content type)
- **Success Handling**: Navigate back after successful save
- **Error Handling**: Show error messages on save failure

### Phase 4: UI Components

#### 4.1 Breadcrumb Navigation
- **Dynamic Path**: Based on content type configuration
- **Navigation**: Back to content list, drill page, etc.
- **State Preservation**: Maintain search terms and page numbers

#### 4.2 Form Layout
- **Title Section**: Language-specific input fields
- **Options Section**: List of dropdown options
- **Action Buttons**: Save, Cancel, Add Option, Delete Option
- **Responsive Design**: Work on different screen sizes

#### 4.3 Option Management
- **Add Option**: Add new empty option to list
- **Delete Option**: Remove option from list (with confirmation)
- **Reorder Options**: Move options up/down (if supported)
- **Option Fields**: Language-specific inputs per option

### Phase 5: Routing Integration

#### 5.1 Update App.tsx Routes
- **Replace Specific Routes**: Remove individual dropdown edit routes
- **Add Shared Route**: `/content/:contentType/dropdown-edit/:actionId`
- **Component Mapping**: Point to SharedDropdownEdit component

#### 5.2 Update Navigation Logic
- **Drill Pages**: Update to use shared route
- **Content Lists**: Update to use shared route
- **Breadcrumbs**: Update to use dynamic paths

### Phase 6: Migration Strategy

#### 6.1 Phase 1: Create and Test
- Create SharedDropdownEdit component
- Test with one content type (mortgage-refi)
- Verify all functionality works

#### 6.2 Phase 2: Migrate Content Types
- Migrate mortgage-refi to shared component
- Migrate mortgage to shared component
- Migrate credit to shared component
- Migrate credit-refi to shared component

#### 6.3 Phase 3: Cleanup
- Remove old specific components
- Update imports and references
- Clean up unused code

### Phase 7: Advanced Features

#### 7.1 Content-Type Specific Features
- **Custom Validation**: Different validation rules per content type
- **Custom UI**: Different field labels or layouts per content type
- **Custom Logic**: Different save behavior per content type

#### 7.2 Plugin Architecture
- **Extensible**: Easy to add new content types
- **Configurable**: All behavior controlled by configuration
- **Maintainable**: Single codebase for all dropdown editing

## Implementation Steps

### Step 1: Create Configuration System
1. Create `src/utils/dropdownConfigs.ts`
2. Define `ContentTypeConfig` interface
3. Create configurations for each content type
4. Export configuration mapping

### Step 2: Create Shared Component
1. Create `src/pages/SharedDropdownEdit/SharedDropdownEdit.tsx`
2. Implement core interfaces and types
3. Add state management and form handling
4. Implement API integration with configuration

### Step 3: Create UI Components
1. Create breadcrumb navigation component
2. Create title fields component
3. Create options management component
4. Create action buttons component

### Step 4: Update Routing
1. Add shared route to App.tsx
2. Update drill page navigation logic
3. Update content list navigation logic
4. Test routing with different content types

### Step 5: Migrate Content Types
1. Test with mortgage-refi first
2. Migrate mortgage content type
3. Migrate credit content types
4. Remove old components

### Step 6: Testing and Validation
1. Test all content types work correctly
2. Verify API calls work for each type
3. Test error handling and edge cases
4. Validate UI consistency across types

## Benefits of Shared Component

### Code Reusability
- Single component for all dropdown editing
- Consistent behavior across content types
- Reduced code duplication

### Maintainability
- Single place to fix bugs
- Single place to add features
- Easier to test and validate

### Scalability
- Easy to add new content types
- Consistent API integration
- Standardized UI/UX

### Type Safety
- TypeScript interfaces for all data
- Configuration-driven behavior
- Compile-time error checking

## Success Criteria

### Functional Requirements
- ✅ All content types can edit dropdowns
- ✅ All API methods work correctly
- ✅ All UI features work consistently
- ✅ Error handling works properly

### Technical Requirements
- ✅ TypeScript interfaces are complete
- ✅ Configuration system is flexible
- ✅ Routing works for all content types
- ✅ No breaking changes to existing functionality

### User Experience Requirements
- ✅ Consistent UI across all content types
- ✅ Intuitive navigation and breadcrumbs
- ✅ Proper loading and error states
- ✅ Responsive design works on all devices

## Notes

### Important Considerations
- **Backward Compatibility**: Ensure existing functionality continues to work
- **Error Handling**: Robust error handling for API failures
- **Performance**: Efficient API calls and state management
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Future Enhancements
- **Real-time Validation**: Validate changes as user types
- **Auto-save**: Save changes automatically
- **Undo/Redo**: Support for undoing changes
- **Bulk Operations**: Edit multiple options at once
