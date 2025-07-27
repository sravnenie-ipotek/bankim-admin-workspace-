import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'ru' | 'he' | 'en';

// Language configuration
export const LANGUAGES = {
  ru: { code: 'ru', name: 'Русский', dir: 'ltr' },
  he: { code: 'he', name: 'עברית', dir: 'rtl' },
  en: { code: 'en', name: 'English', dir: 'ltr' }
} as const;

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, any>) => string;

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationFunction;
  isRTL: boolean;
  translations: Record<string, any>;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Language Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage = 'ru' 
}) => {
  // Get initial language from localStorage or use default
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage in LANGUAGES) {
      return savedLanguage as Language;
    }
    return defaultLanguage;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        let translationData;
        
        // Import translations based on language
        switch (language) {
          case 'ru':
            translationData = (await import('../locales/ru.json')).default;
            break;
          case 'he':
            translationData = (await import('../locales/he.json')).default;
            break;
          case 'en':
            translationData = (await import('../locales/en.json')).default;
            break;
          default:
            translationData = (await import('../locales/ru.json')).default;
        }
        
        setTranslations(translationData);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Try to load Russian as fallback
        try {
          const fallbackData = (await import('../locales/ru.json')).default;
          setTranslations(fallbackData);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
    };

    loadTranslations();
  }, [language]);

  // Update document direction when language changes
  useEffect(() => {
    const dir = LANGUAGES[language].dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Translation function
  const t: TranslationFunction = (key: string, params?: Record<string, any>) => {
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    let value: any = translations;

    // Navigate through the nested structure
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // If the value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    }

    return value;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: LANGUAGES[language].dir === 'rtl',
    translations
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get language name
export const getLanguageName = (code: Language): string => {
  return LANGUAGES[code].name;
};