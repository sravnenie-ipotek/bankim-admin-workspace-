// Import all translation files
import ruTranslations from './ru.json';
import heTranslations from './he.json';
import enTranslations from './en.json';

// Export translations
export const translations = {
  ru: ruTranslations,
  he: heTranslations,
  en: enTranslations
} as const;

// Export language codes
export const LANGUAGE_CODES = ['ru', 'he', 'en'] as const;
export type LanguageCode = typeof LANGUAGE_CODES[number];

// Export language configurations
export const LANGUAGE_CONFIG = {
  ru: {
    code: 'ru',
    name: 'Русский',
    nativeName: 'Русский',
    dir: 'ltr' as const,
    flag: '🇷🇺'
  },
  he: {
    code: 'he', 
    name: 'Hebrew',
    nativeName: 'עברית',
    dir: 'rtl' as const,
    flag: '🇮🇱'
  },
  en: {
    code: 'en',
    name: 'English', 
    nativeName: 'English',
    dir: 'ltr' as const,
    flag: '🇺🇸'
  }
};

// Helper function to get translation
export const getTranslation = (
  language: LanguageCode,
  key: string,
  params?: Record<string, any>
): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key as fallback
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? String(params[param]) : match;
    });
  }

  return value;
};