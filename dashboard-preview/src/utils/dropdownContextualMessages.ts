/**
 * Contextual Dropdown Messages System
 * 
 * Provides contextually appropriate "no options available" messages based on dropdown type
 * instead of generic "Option not found in database" messages.
 * 
 * @version 1.0.0
 * @since 2025-08-02
 */

export interface ContextualMessage {
  ru: string;
  he: string;
  en?: string;
}

export interface DropdownTypeMapping {
  pattern: RegExp;
  type: string;
  message: ContextualMessage;
}

/**
 * Dropdown type mappings based on content_key patterns and semantics
 * Order matters - more specific patterns should come first
 */
export const DROPDOWN_TYPE_MAPPINGS: DropdownTypeMapping[] = [
  // Filter/Search dropdowns (used in step4, results pages) - must come before mortgage pattern
  {
    pattern: /filter|search|sort|фильтр|поиск|сортировка|סינון|חיפוש|מיון/i,
    type: 'filter',
    message: {
      ru: 'Фильтры не настроены',
      he: 'מסננים לא מוגדרים',
      en: 'Filters not configured'
    }
  },
  
  // Property/Real Estate dropdowns with ownership specificity
  {
    pattern: /ownership|владение|בעלות|property_ownership/i,
    type: 'property',
    message: {
      ru: 'Варианты недвижимости не определены',
      he: 'אפשרויות נדל"ן לא מוגדרות',
      en: 'Property options not defined'
    }
  },
  
  // Credit/Mortgage type dropdowns - specific patterns for mortgage/credit types
  {
    pattern: /(mortgage.*type|credit.*type|type.*mortgage|type.*credit|тип.*ипотек|тип.*кредит|סוג.*משכנתא|סוג.*אשראי)/i,
    type: 'credit',
    message: {
      ru: 'Кредитные варианты не определены',
      he: 'אפשרויות אשראי לא מוגדרות',
      en: 'Credit options not defined'
    }
  },
  
  // Geographic/Location dropdowns
  {
    pattern: /city|location|region|country|citizenship|город|гражданство|страна|עיר|אזרחות|מדינה/i,
    type: 'geographic',
    message: {
      ru: 'Географические варианты не настроены',
      he: 'אפשרויות גיאוגרפיות לא מוגדרות',
      en: 'Geographic options not configured'
    }
  },
  
  // Time/Date related dropdowns
  {
    pattern: /when|time|period|duration|date|birth|birthday|рождения|срок|время|дата|когда|לידה|מתי|תקופה|זמן|יום הולדת/i,
    type: 'temporal',
    message: {
      ru: 'Временные варианты не заданы',
      he: 'אפשרויות זמן לא מוגדרות',
      en: 'Time options not configured'
    }
  },
  
  // Yes/No/Boolean dropdowns
  {
    pattern: /first|has_|is_|additional|первая|есть|имеется|ראשון|יש|первую/i,
    type: 'boolean',
    message: {
      ru: 'Варианты выбора не установлены',
      he: 'אפשרויות בחירה לא מוגדרות',
      en: 'Selection options not set up'
    }
  },
  
  // Financial/Monetary dropdowns - specific financial terms
  {
    pattern: /price|payment|fee|amount|sum|cost|initial|monthly|стоимость|платеж|взнос|сумма|ежемесячный|первоначальный|מחיר|תשלום|עלות|חודשי/i,
    type: 'financial',
    message: {
      ru: 'Финансовые варианты не настроены',
      he: 'אפשרויות פיננסיות לא מוגדרות',
      en: 'Financial options not configured'
    }
  },
  
  // Personal/Demographics dropdowns
  {
    pattern: /family|status|employment|education|income|семейное|статус|работа|доходы|положение|משפחה|סטטוס|עבודה|הכנסה|משפחתי/i,
    type: 'personal',
    message: {
      ru: 'Личные варианты не заданы',
      he: 'אפשרויות אישיות לא מוגדרות',
      en: 'Personal options not set up'
    }
  },
  
  // Document/Document Type dropdowns
  {
    pattern: /document|certificate|passport|документ|удостоверение|паспорт|מסמך|תעודה|דרכון/i,
    type: 'document',
    message: {
      ru: 'Типы документов не настроены',
      he: 'סוגי מסמכים לא מוגדרים',
      en: 'Document types not configured'
    }
  },
  
  // General property dropdowns (broader than ownership)
  {
    pattern: /property|type|недвижимость|тип|נכס|סוג/i,
    type: 'property',
    message: {
      ru: 'Варианты недвижимости не определены',
      he: 'אפשרויות נדל"ן לא מוגדרות',
      en: 'Property options not defined'
    }
  },
  
  // Loan/Credit general dropdowns (after more specific credit patterns)
  {
    pattern: /mortgage|credit|loan|purpose|history|ипотека|кредит|цель|история|משכנתא|אשראי|מטרה|היסטוריה/i,
    type: 'credit',
    message: {
      ru: 'Кредитные варианты не определены',
      he: 'אפשרויות אשראי לא מוגדרות',
      en: 'Credit options not defined'
    }
  },
  
  // Generic/Form field dropdowns (catch-all)
  {
    pattern: /.*/,
    type: 'generic',
    message: {
      ru: 'Варианты для этого поля не настроены',
      he: 'אפשרויות עבור שדה זה לא מוגדרות',
      en: 'Options for this field not configured'
    }
  }
];

/**
 * Determines the dropdown type based on content key and returns appropriate message
 * 
 * @param contentKey - The content key of the dropdown
 * @param russianTitle - Russian title/label of the dropdown (optional, for better context)
 * @param hebrewTitle - Hebrew title/label of the dropdown (optional, for better context) 
 * @returns Contextual message for missing options
 */
export function getContextualMessage(
  contentKey: string, 
  russianTitle?: string, 
  hebrewTitle?: string
): ContextualMessage {
  
  // Combine content key and titles for better pattern matching
  const combinedContext = [contentKey, russianTitle, hebrewTitle]
    .filter(Boolean)
    .join(' ');
  
  // Find the first matching pattern
  for (const mapping of DROPDOWN_TYPE_MAPPINGS) {
    if (mapping.pattern.test(combinedContext)) {
      console.log(`🎯 Dropdown type detected: ${mapping.type} for "${contentKey}"`);
      return mapping.message;
    }
  }
  
  // Fallback to generic message (this should rarely happen due to catch-all pattern)
  console.warn(`⚠️ No pattern matched for "${contentKey}", using generic message`);
  return DROPDOWN_TYPE_MAPPINGS[DROPDOWN_TYPE_MAPPINGS.length - 1].message;
}

/**
 * Creates fallback options array with contextual messages
 * 
 * @param contentKey - The content key of the dropdown
 * @param russianTitle - Russian title/label of the dropdown (optional)
 * @param hebrewTitle - Hebrew title/label of the dropdown (optional)
 * @returns Array of fallback options with contextual messages
 */
export function createFallbackOptions(
  contentKey: string,
  russianTitle?: string,
  hebrewTitle?: string
): Array<{ru: string, he: string}> {
  
  const contextualMessage = getContextualMessage(contentKey, russianTitle, hebrewTitle);
  
  return [
    contextualMessage,
    {
      ru: 'Добавьте варианты для этого поля',
      he: 'הוסף אפשרויות עבור שדה זה',
    }
  ];
}

/**
 * Utility function to get dropdown type for analytics/debugging
 * 
 * @param contentKey - The content key of the dropdown
 * @param russianTitle - Russian title/label of the dropdown (optional)
 * @param hebrewTitle - Hebrew title/label of the dropdown (optional)
 * @returns The detected dropdown type
 */
export function getDropdownType(
  contentKey: string,
  russianTitle?: string,
  hebrewTitle?: string
): string {
  
  const combinedContext = [contentKey, russianTitle, hebrewTitle]
    .filter(Boolean)
    .join(' ');
  
  for (const mapping of DROPDOWN_TYPE_MAPPINGS) {
    if (mapping.pattern.test(combinedContext)) {
      return mapping.type;
    }
  }
  
  return 'generic';
}

/**
 * Test function to validate pattern matching against known content keys
 * (for development and debugging)
 */
export function testPatternMatching() {
  const testCases = [
    { key: 'calculate_mortgage_city', expected: 'geographic' },
    { key: 'calculate_mortgage_when', expected: 'temporal' },
    { key: 'calculate_mortgage_first', expected: 'boolean' },
    { key: 'calculate_mortgage_price', expected: 'financial' },
    { key: 'calculate_mortgage_property_ownership', expected: 'property' },
    { key: 'calculate_mortgage_family_status', expected: 'personal' },
    { key: 'calculate_mortgage_citizenship_dropdown', expected: 'geographic' },
    { key: 'mortgage_step4_filter', expected: 'filter' },
    { key: 'app.mortgage.form.calculate_mortgage_type', expected: 'property' },
  ];
  
  console.log('🧪 Testing dropdown pattern matching:');
  testCases.forEach(({ key, expected }) => {
    const detected = getDropdownType(key);
    const status = detected === expected ? '✅' : '❌';
    console.log(`${status} ${key} → detected: ${detected}, expected: ${expected}`);
  });
}