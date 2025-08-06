# Pagination Component

A modern, UX-friendly pagination component with consistent heights and accessibility features.

## Features

✅ **Consistent Heights** - All buttons have uniform heights to prevent layout shifts  
✅ **UX Optimized** - Smooth hover effects, focus management, and visual feedback  
✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support  
✅ **Responsive** - Mobile-friendly with touch-optimized interactions  
✅ **Size Variants** - Small, medium, and large sizes for different use cases  
✅ **Smart Pagination** - Shows relevant page numbers with ellipsis for many pages  

## Usage

```tsx
import { Pagination } from '../../components';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredItems.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  size="medium"
  showInfo={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | - | Current active page (1-based) |
| `totalPages` | `number` | - | Total number of pages |
| `totalItems` | `number` | - | Total number of items |
| `itemsPerPage` | `number` | - | Items per page |
| `onPageChange` | `(page: number) => void` | - | Callback when page changes |
| `showInfo` | `boolean` | `true` | Show "Showing X-Y of Z" text |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `className` | `string` | `''` | Additional CSS classes |

## Size Variants

### Small (`size="small"`)
- Height: 32px
- Font size: 12px
- Ideal for: Dense tables, sidebars

### Medium (`size="medium"`) - Default
- Height: 40px  
- Font size: 14px
- Ideal for: Main content areas, lists

### Large (`size="large"`)
- Height: 48px
- Font size: 16px
- Ideal for: Hero sections, large displays

## UX Improvements

- **Consistent Heights**: All elements (buttons, ellipsis) have exact same height
- **Visual Feedback**: Hover effects with subtle elevation and color changes  
- **Keyboard Navigation**: Full keyboard accessibility with focus indicators
- **Smart Logic**: Shows first, last, and pages around current with ellipsis
- **Touch-Friendly**: Minimum 40px touch targets on mobile
- **Loading States**: Optional loading state support

## Examples

### Basic Usage
```tsx
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(items.length / itemsPerPage);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}  
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
```

### Small Table Pagination
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  size="small"
  showInfo={false}
/>
```

### Large Hero Pagination
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={items.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  size="large"
  className="hero-pagination"
/>
```

## Migration Guide

### From Old Pagination

Replace your old pagination implementation:

```tsx
// OLD ❌
<div className="row-view12">
  <span className="text18">Показывает {startIndex + 1}-{endIndex} из {totalItems}</span>
  <div className="row-view13">
    {/* Complex manual pagination logic */}
  </div>
</div>

// NEW ✅
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation (Tab, Enter, Space)
- Focus indicators
- High contrast mode support
- Semantic HTML structure 