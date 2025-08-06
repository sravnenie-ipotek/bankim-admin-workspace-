import { ContentItem, ContentTranslation } from '../types/content';

/**
 * Extract translation value for a specific language from content translations
 */
export function getTranslation(
  translations: Record<string, string> | ContentTranslation[],
  language: string,
  fallback = ''
): string {
  if (Array.isArray(translations)) {
    const translation = translations.find(t => t.language_code === language);
    return translation?.content_value || fallback;
  }
  return translations[language] || fallback;
}

/**
 * Check if content item is valid and active
 */
export function isValidContent(item: ContentItem | null | undefined): item is ContentItem {
  return !!(item && item.id && item.is_active);
}

/**
 * Format content key for display purposes
 */
export function formatContentKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Get component type display name
 */
export function getComponentTypeDisplayName(componentType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'Text Content',
    'dropdown': 'Dropdown',
    'button': 'Button',
    'header': 'Header',
    'link': 'Link',
    'option': 'Option',
    'drill': 'Drill Down',
    'calculate': 'Calculator',
  };
  
  return typeMap[componentType] || formatContentKey(componentType);
}