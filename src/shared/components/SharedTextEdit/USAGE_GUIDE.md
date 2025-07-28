# SharedTextEdit Usage Guide

Quick implementation guide for adding text editing to new content types.

## 🚀 Quick Implementation Steps

### Step 1: Create Wrapper Component

Create directory: `src/pages/[ContentType]TextEdit/`

**File: `[ContentType]TextEdit.tsx`**
```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedTextEdit, type TextEditData, type BreadcrumbItem } from '../../shared/components/SharedTextEdit';

interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  action_number?: number;
  last_modified: string;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
}

const [ContentType]TextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const actionNumber = location.state?.actionNumber || null;

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📋 Fetching [contentType] content item with ID: ${actionId}`);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        if (targetContent) {
          const normalizedContent: ContentItem = {
            id: targetContent.id?.toString() || actionId || '',
            action_number: (targetContent as any).action_number,
            content_key: targetContent.content_key || '',
            component_type: targetContent.component_type || 'text',
            screen_location: targetContent.screen_location || '',
            description: targetContent.description || (targetContent as any).translations?.ru || '',
            is_active: targetContent.is_active !== false,
            translations: {
              ru: (targetContent as any).translations?.ru || '',
              he: (targetContent as any).translations?.he || '',
              en: (targetContent as any).translations?.en || ''
            },
            last_modified: targetContent.updated_at || new Date().toISOString()
          };

          setContent(normalizedContent);
        } else {
          setError('Content not found');
        }
      } else {
        setError('Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching [contentType] content:', err);
      setError('Failed to load [contentType] content data');
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

      console.log(`💾 Saving [contentType] content item ${content.id}:`, updateData);
      const response = await apiService.updateContentItem(content.id, updateData);
      
      if (response.success) {
        console.log('✅ [ContentType] content updated successfully');
        handleCancel(); // Go back to previous page
      } else {
        setError('Failed to save [contentType] content');
      }
    } catch (err) {
      console.error('Error saving [contentType] content:', err);
      setError('Failed to save [contentType] content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const returnPath = location.state?.returnPath;
    const fromPage = location.state?.fromPage || 1;
    const searchTerm = location.state?.searchTerm || '';
    
    if (returnPath) {
      navigate(returnPath, { 
        state: { 
          fromPage: fromPage,
          searchTerm: searchTerm 
        } 
      });
    } else {
      navigate('/content/[contenttype]', { 
        state: { 
          fromPage: fromPage,
          searchTerm: searchTerm 
        } 
      });
    }
  };

  // Create breadcrumbs for navigation
  const breadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Контент сайта', 
      onClick: () => navigate('/content/[contenttype]'),
      isActive: false 
    },
    { 
      label: '[Content Type Display Name]', 
      onClick: () => navigate('/content/[contenttype]'),
      isActive: false 
    },
    { 
      label: `Действие №${actionNumber || content?.action_number || actionId}`, 
      isActive: true 
    }
  ];

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
        pageSubtitle="Редактирование текста [content type]"
      />
    );
  }

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

**File: `index.ts`**
```tsx
export { default } from './[ContentType]TextEdit';
```

### Step 2: Update App.tsx

**Add Import:**
```tsx
import [ContentType]TextEdit from './pages/[ContentType]TextEdit';
```

**Add Route:**
```tsx
{/* [ContentType] text edit route */}
<Route 
  path="/content/[contenttype]/text-edit/:actionId" 
  element={
    <ErrorBoundary>
      <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
        <AdminLayout title="Редактирование текста [content type]" activeMenuItem="content-[contenttype]">
          <[ContentType]TextEdit />
        </AdminLayout>
      </ProtectedRoute>
    </ErrorBoundary>
  } 
/>
```

### Step 3: Replacement Checklist

Replace these placeholders in your implementation:

- [ ] `[ContentType]` → Your component name (e.g., `Credit`, `ProductInfo`)
- [ ] `[contentType]` → Your content type for logging (e.g., `credit`, `product-info`)
- [ ] `[contenttype]` → Your route path (e.g., `credit`, `product-info`)
- [ ] `[Content Type Display Name]` → Display name for breadcrumbs (e.g., `Кредит`)
- [ ] `[content type]` → Lowercase for messages (e.g., `кредита`)

## 🔧 Real Working Examples

### Credit Implementation
```tsx
// Component: CreditTextEdit
// Route: /content/credit/text-edit/:actionId
// Breadcrumb: "Кредит"
// Navigate back: /content/credit
```

### Credit-Refi Implementation
```tsx
// Component: CreditRefiTextEdit
// Route: /content/credit-refi/text-edit/:actionId
// Breadcrumb: "Рефинансирование кредита"
// Navigate back: /content/credit-refi
```

## ✅ Testing Checklist

After implementation, test these scenarios:

- [ ] **Navigation to edit page**: From drill page, click text item
- [ ] **Loading state**: Page shows loading while fetching data
- [ ] **Data display**: Russian and Hebrew text loads correctly
- [ ] **Save functionality**: Changes are saved and navigate back
- [ ] **Cancel functionality**: Cancels without saving and navigate back
- [ ] **Error handling**: Shows error if API fails
- [ ] **Breadcrumb navigation**: Clicking breadcrumbs works
- [ ] **Authentication**: Route is protected and requires login

## 🎯 Navigation States

The wrapper must handle these navigation states properly:

```tsx
// From drill page
location.state = {
  returnPath: '/content/[contenttype]/drill/[stepId]',
  fromPage: 1,
  searchTerm: 'some search',
  actionNumber: 5
}

// Navigate back preserves state
navigate(returnPath, { 
  state: { 
    fromPage: fromPage,
    searchTerm: searchTerm 
  } 
});
```

## 🚨 Common Mistakes

### ❌ Don't use SharedTextEdit directly
```tsx
// WRONG
<Route element={<SharedTextEdit />} />
```

### ❌ Don't forget error boundaries
```tsx
// WRONG - No ErrorBoundary
<Route element={<CreditTextEdit />} />

// CORRECT
<Route element={
  <ErrorBoundary>
    <CreditTextEdit />
  </ErrorBoundary>
} />
```

### ❌ Don't hardcode navigation paths
```tsx
// WRONG - Hardcoded
const handleCancel = () => navigate('/content/credit');

// CORRECT - Use location.state
const handleCancel = () => {
  const returnPath = location.state?.returnPath;
  if (returnPath) {
    navigate(returnPath, { state: navigationState });
  } else {
    navigate('/content/credit', { state: navigationState });
  }
};
```

## 📱 Final Verification

Your text editing should work with this flow:

1. **Content List** → Shows your content type with items
2. **Drill Page** → Shows items, text items show "ТИП = Текст"
3. **Click Text Item** → Navigates to `/content/[contenttype]/text-edit/:actionId`
4. **Edit Page** → Shows SharedTextEdit interface with data
5. **Save/Cancel** → Returns to drill page with preserved state

Done! Your text editing is now fully functional with SharedTextEdit! 🎉 