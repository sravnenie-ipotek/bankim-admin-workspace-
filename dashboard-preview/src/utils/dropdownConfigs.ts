/**
 * Dropdown Configuration System
 * Centralized configuration for all dropdown edit components
 */

import { apiService } from '../services/api';

export interface DropdownOption {
  ru: string;
  he: string;
  en?: string;
}

export interface DropdownContent {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
  last_modified: string;
  action_number?: number;
}

export interface ContentTypeConfig {
  contentType: 'mortgage' | 'mortgage-refi' | 'credit' | 'credit-refi';
  pageTitle: string;
  activeMenuItem: string;
  breadcrumbBase: string;
  breadcrumbLabels: {
    contentSite: string;
    contentType: string;
    actionsList: string;
    editDropdown: string;
  };
  api: {
    fetchContent: (id: string) => Promise<any>;
    fetchOptions: (contentKey: string) => Promise<any>;
    updateTitle: (id: string, lang: string, value: string) => Promise<any>;
    updateOptions?: (id: string, options: DropdownOption[]) => Promise<any>;
  };
  supportedLanguages: ('ru' | 'he' | 'en')[];
  features: {
    optionManagement: boolean;
    optionReordering: boolean;
    englishSupport: boolean;
  };
}

// Configuration for each content type
export const dropdownConfigs: Record<string, ContentTypeConfig> = {
  mortgage: {
    contentType: 'mortgage',
    pageTitle: 'Редактирование дропдауна ипотеки',
    activeMenuItem: 'content-mortgage',
    breadcrumbBase: '/content/mortgage',
    breadcrumbLabels: {
      contentSite: 'Контент сайта',
      contentType: 'Рассчитать ипотеку',
      actionsList: 'Список действий',
      editDropdown: 'Редактирование дропдауна'
    },
    api: {
      fetchContent: async (id: string) => {
        try {
          const response = await fetch(`/api/content/item/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      fetchOptions: (contentKey: string) => apiService.getMortgageDropdownOptions(contentKey),
      updateTitle: (id: string, lang: string, value: string) => 
        apiService.updateContentTranslation(id, lang, value),
      updateOptions: async (id: string, options: DropdownOption[]) => {
        try {
          const response = await fetch(`/api/content/mortgage/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dropdown_options: options })
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      }
    },
    supportedLanguages: ['ru', 'he'],
    features: {
      optionManagement: true,
      optionReordering: true,
      englishSupport: false
    }
  },
  
  'mortgage-refi': {
    contentType: 'mortgage-refi',
    pageTitle: 'Редактирование дропдауна рефинансирования',
    activeMenuItem: 'content-mortgage-refi',
    breadcrumbBase: '/content/mortgage-refi',
    breadcrumbLabels: {
      contentSite: 'Контент сайта',
      contentType: 'Рефинансирование ипотеки',
      actionsList: 'Список действий',
      editDropdown: 'Редактирование дропдауна'
    },
    api: {
      fetchContent: async (id: string) => {
        try {
          const response = await fetch(`/api/content/item/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      fetchOptions: (contentKey: string) => apiService.getMortgageRefiDropdownOptions(contentKey),
      updateTitle: (id: string, lang: string, value: string) => 
        apiService.updateContentTranslation(id, lang, value),
      // Mortgage-refi doesn't have bulk option update, handled individually
    },
    supportedLanguages: ['ru', 'he'],
    features: {
      optionManagement: true,
      optionReordering: true,
      englishSupport: false
    }
  },
  
  credit: {
    contentType: 'credit',
    pageTitle: 'Редактирование дропдауна кредита',
    activeMenuItem: 'content-credit',
    breadcrumbBase: '/content/credit',
    breadcrumbLabels: {
      contentSite: 'Контент сайта',
      contentType: 'Расчет Кредита',
      actionsList: 'Список действий',
      editDropdown: 'Редактирование дропдауна'
    },
    api: {
      fetchContent: async (id: string) => {
        try {
          const response = await fetch(`/api/content/item/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      fetchOptions: async (contentKey: string) => {
        try {
          const response = await fetch(`/api/content/credit/${encodeURIComponent(contentKey)}/options`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      updateTitle: (id: string, lang: string, value: string) => 
        apiService.updateContentTranslation(id, lang, value),
      updateOptions: async (id: string, options: DropdownOption[]) => {
        try {
          const response = await fetch(`/api/content/credit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dropdown_options: options })
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      }
    },
    supportedLanguages: ['ru', 'he', 'en'],
    features: {
      optionManagement: true,
      optionReordering: true,
      englishSupport: true
    }
  },
  
  'credit-refi': {
    contentType: 'credit-refi',
    pageTitle: 'Редактирование дропдауна рефинансирования кредита',
    activeMenuItem: 'content-credit-refi',
    breadcrumbBase: '/content/credit-refi',
    breadcrumbLabels: {
      contentSite: 'Контент сайта',
      contentType: 'Рефинансирование Кредита',
      actionsList: 'Список действий',
      editDropdown: 'Редактирование дропдауна'
    },
    api: {
      fetchContent: async (id: string) => {
        try {
          const response = await fetch(`/api/content/item/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      fetchOptions: async (contentKey: string) => {
        try {
          const response = await fetch(`/api/content/credit-refi/${encodeURIComponent(contentKey)}/options`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return { success: response.ok, data };
        } catch (error) {
          return { success: false, error };
        }
      },
      updateTitle: (id: string, lang: string, value: string) => 
        apiService.updateContentTranslation(id, lang, value),
      // Credit-refi doesn't have bulk option update, handled individually
    },
    supportedLanguages: ['ru', 'he', 'en'],
    features: {
      optionManagement: true,
      optionReordering: true,
      englishSupport: true
    }
  }
};

// Helper function to get config by content type
export const getDropdownConfig = (contentType: string): ContentTypeConfig | null => {
  return dropdownConfigs[contentType] || null;
};