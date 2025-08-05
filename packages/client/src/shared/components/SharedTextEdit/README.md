# SharedTextEdit Component

A reusable text editing interface component for all content types in the BankIM Management Portal.

## 🎯 Purpose

SharedTextEdit provides a consistent, feature-rich text editing interface that can be used across different content types (credit, credit-refi, mortgage, mortgage-refi, etc.) while maintaining the same look, feel, and functionality.

## ⚠️ Important: Do NOT Use Directly!

**This component should NEVER be used directly in routes.** It requires wrapper components that handle data fetching and state management.

```tsx
// ❌ WRONG - Do not use directly in routes
<Route path="/content/credit/text-edit/:actionId" element={<SharedTextEdit />} />

// ✅ CORRECT - Use through wrapper component
<Route path="/content/credit/text-edit/:actionId" element={<CreditTextEdit />} />
```

## 📁 Component Structure

```
src/shared/components/SharedTextEdit/
├── SharedTextEdit.tsx      # Main component (295 lines)
├── SharedTextEdit.css      # Component styles (446 lines)
├── index.ts               # Export file
└── README.md              # This documentation
```

## 🔧 Required Props

### `content: TextEditData`
The content item to edit. Must include:
```tsx
interface TextEditData {
  id: string;
  action_number?: number;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
  last_modified: string;
}
```

### `breadcrumbs: BreadcrumbItem[]`
Navigation breadcrumbs for the top of the page:
```tsx
interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}
```

### `onSave: (data) => void`
Callback function called when user saves:
```tsx
onSave: (data: { 
  ruText: string; 
  heText: string; 
  additionalTexts: Array<{ ru: string; he: string }> 
}) => void
```

### `onCancel: () => void`
Callback function called when user cancels or goes back.

## 🎛️ Optional Props

- `loading?: boolean` - Shows loading state
- `error?: string | null` - Displays error message
- `showAdditionalText?: boolean` - Shows additional text input section
- `pageSubtitle?: string` - Custom subtitle for the page

## 🏗️ How to Create Wrapper Components

### 1. Create Directory Structure
```
src/pages/[ContentType]TextEdit/
├── [ContentType]TextEdit.tsx
└── index.ts
```

### 2. Implement Wrapper Component

```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedTextEdit, type TextEditData, type BreadcrumbItem } from '../../shared/components/SharedTextEdit';

const [ContentType]TextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        // Normalize data for SharedTextEdit
        setContent(normalizeContentData(response.data));
      } else {
        setError('Failed to fetch content');
      }
    } catch (err) {
      setError('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { ruText: string; heText: string; additionalTexts: Array<{ ru: string; he: string }> }) => {
    if (!content) return;

    try {
      setSaving(true);
      const updateData = {
        translations: {
          ru: data.ruText,
          he: data.heText,
          en: content.translations.en || ''
        }
      };

      const response = await apiService.updateContentItem(content.id, updateData);
      
      if (response.success) {
        handleCancel(); // Navigate back
      } else {
        setError('Failed to save content');
      }
    } catch (err) {
      setError('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navigate back with proper state
    const returnPath = location.state?.returnPath;
    const navigationState = {
      fromPage: location.state?.fromPage || 1,
      searchTerm: location.state?.searchTerm || ''
    };
    
    if (returnPath) {
      navigate(returnPath, { state: navigationState });
    } else {
      navigate('/content/[contentType]', { state: navigationState });
    }
  };

  // Create breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Контент сайта', 
      onClick: () => navigate('/content/[contentType]'),
      isActive: false 
    },
    { 
      label: '[Content Type Name]', 
      onClick: () => navigate('/content/[contentType]'),
      isActive: false 
    },
    { 
      label: `Действие №${content?.action_number || actionId}`, 
      isActive: true 
    }
  ];

  // Loading state
  if (loading || !content) {
    return (
      <SharedTextEdit
        content={null as any}
        breadcrumbs={breadcrumbs}
        loading={loading}
        error={error}
        onSave={handleSave}
        onCancel={handleCancel}
        showAdditionalText={false}
        pageSubtitle="Loading..."
      />
    );
  }

  // Convert to SharedTextEdit format
  const textEditData: TextEditData = {
    id: content.id,
    action_number: content.action_number,
    content_key: content.content_key,
    component_type: content.component_type,
    screen_location: content.screen_location,
    description: content.description,
    is_active: content.is_active,
    translations: content.translations,
    last_modified: content.last_modified
  };

  return (
    <SharedTextEdit
      content={textEditData}
      breadcrumbs={breadcrumbs}
      loading={saving}
      error={error}
      onSave={handleSave}
      onCancel={handleCancel}
      showAdditionalText={false}
      pageSubtitle="Редактирование текста [content type]"
    />
  );
};

export default [ContentType]TextEdit;
```

### 3. Create Index File
```tsx
// src/pages/[ContentType]TextEdit/index.ts
export { default } from './[ContentType]TextEdit';
```

### 4. Add Route in App.tsx
```tsx
// Import
import [ContentType]TextEdit from './pages/[ContentType]TextEdit';

// Route
<Route 
  path="/content/[contentType]/text-edit/:actionId" 
  element={
    <ErrorBoundary>
      <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
        <AdminLayout title="[Title]" activeMenuItem="content-[contentType]">
          <[ContentType]TextEdit />
        </AdminLayout>
      </ProtectedRoute>
    </ErrorBoundary>
  } 
/>
```

## ✅ Working Examples

These wrapper components are already implemented and working:

### Credit Text Editing
- **Wrapper**: `src/pages/CreditTextEdit/CreditTextEdit.tsx`
- **Route**: `/content/credit/text-edit/:actionId`
- **Usage**: Edit text items from credit drill pages

### Credit-Refi Text Editing
- **Wrapper**: `src/pages/CreditRefiTextEdit/CreditRefiTextEdit.tsx`
- **Route**: `/content/credit-refi/text-edit/:actionId`
- **Usage**: Edit text items from credit-refi drill pages

### Mortgage Text Editing
- **Wrapper**: `src/pages/MortgageTextEdit/MortgageTextEdit.tsx`
- **Route**: `/content/mortgage/text-edit/:actionId`
- **Usage**: Edit text items from mortgage drill pages

### Mortgage-Refi Text Editing
- **Wrapper**: `src/pages/MortgageRefiTextEdit/MortgageRefiTextEdit.tsx`
- **Route**: `/content/mortgage-refi/text-edit/:actionId`
- **Usage**: Edit text items from mortgage-refi drill pages

## 🔄 Navigation Flow

```
Content List → Drill Page → Text Item (ТИП = Текст) → Text Edit Component
     ↓              ↓                    ↓                     ↓
/content/credit → /drill/step → click text item → /text-edit/:actionId
```

The drill pages detect when an item has `component_type = 'text'` and route to the appropriate text-edit URL.

## ❌ Common Errors & Solutions

### Error: "Cannot read properties of undefined (reading 'map')"
- **Cause**: Using SharedTextEdit directly without props
- **Fix**: Create wrapper component that fetches data and provides props

### Error: "Page redirects to /admin/login"
- **Cause**: Missing route definition for text-edit URL
- **Fix**: Add route in App.tsx with proper wrapper component

### Error: "Navigation back doesn't work"
- **Cause**: Missing returnPath in location.state
- **Fix**: Ensure drill pages pass navigation state when navigating to edit

### Error: "Content data is empty"
- **Cause**: API endpoint returning empty translations (status filter issue)
- **Fix**: Check backend API endpoints for status filtering

## 🎨 UI Features

SharedTextEdit provides:
- **Breadcrumb navigation** at the top
- **Russian text input** (left side)
- **Hebrew text input** (right side)
- **Optional English text input**
- **Save and Cancel buttons**
- **Loading states**
- **Error handling**
- **Responsive design**

## 📱 Responsive Design

The component is designed to work on different screen sizes and maintains the BankIM design system styling.

## 🔧 Backend Requirements

For SharedTextEdit to work properly, the backend must provide:

1. **GET `/api/content/item/:itemId`** - Fetch individual content item
2. **PUT `/api/content/item/:itemId`** - Update content item translations

## 🚀 Quick Start Checklist

When implementing text editing for a new content type:

- [ ] Create wrapper component directory: `src/pages/[ContentType]TextEdit/`
- [ ] Implement wrapper component with data fetching
- [ ] Create index.ts export file
- [ ] Import wrapper in App.tsx
- [ ] Add route configuration in App.tsx
- [ ] Test navigation: list → drill → edit → save/cancel
- [ ] Verify authentication works properly
- [ ] Test error handling scenarios

## 📚 Related Documentation

- **Overall Pattern**: `devHelp/contentMenu/cssPages/screens/editTextDrill/editTextDrill.md`
- **Design System**: Check AdminLayout and other shared components
- **API Documentation**: Backend server.js endpoints

---

**Remember**: Always use wrapper components, never use SharedTextEdit directly in routes! 