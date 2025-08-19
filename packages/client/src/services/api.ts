/**
 * API Service for BankIM Management Portal
 * Centralized API calls for all backend operations
 */

import {
  ApiResponse,
  TextContent,
  ContentItem,
  ContentTranslation,
  FormulaData,
  UISetting,
  Language,
  ContentCategory,
} from '@bankim/shared';
import { ContentPage } from '../pages/Chat/ContentManagement/types/contentTypes';
import { ContentListItem } from '../pages/ContentListBase/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:4000');

const USE_REAL_CONTENT_DATA = import.meta.env.VITE_USE_REAL_CONTENT_DATA === 'true';
const CONTENT_CACHE_TTL = parseInt(import.meta.env.VITE_CONTENT_CACHE_TTL || '300000');

// Detect placeholder API URLs and disable API calls for development
const isPlaceholderUrl = (url: string): boolean => {
  // If real content data is explicitly enabled, don't treat URLs as placeholders
  if (USE_REAL_CONTENT_DATA) {
    return false;
  }
  
  return url.includes('your-api-domain.railway.app') || 
         url.includes('your-backend-domain.railway.app');
         // Removed localhost:3001 check - this is our REAL backend!
};

// Main Page Content interfaces following CSS example structure
interface MainPageAction {
  id: string;                  // "Income_Main" pattern (CSS lines 354-410)
  actionNumber: number;        // 1-12 from CSS example
  title: string;               // "X.Основной источник дохода" (CSS lines 264-342)
  titleRu: string;             // "Рассчитать Ипотеку" (CSS lines 488-543)
  titleHe: string;             // "חשב את המשכנתא שלך" (CSS lines 555-610)
  titleEn: string;             // "Calculate Mortgage"
  actionType: string;          // "Дропдаун", "Ссылка", "Текст" (CSS lines 421-477)
  status: 'published' | 'draft' | 'archived';
  createdBy: string;
  lastModified: Date;
  createdAt: Date;
}

interface LocalMainPageContent {
  pageTitle: string;           // "Калькулятор ипотеки Страница №2" (CSS line 160)
  actionCount: number;         // 33 (CSS line 172)
  lastModified: string;        // "01.08.2023 | 15:03" (CSS line 180)
  actions: MainPageAction[];   // 12 items (CSS lines 264-342)
  galleryImages: string[];     // Page state images (CSS lines 189-227)
}

// Local interfaces specific to this API service
interface LocalTextContent {
  id: string;
  actionNumber: number;
  titleRu: string;
  titleHe: string;
  titleEn: string;
  contentType: string;
  textContent: {
    ru: string;
    he: string;
    en: string;
  };
  additionalText?: Array<{
    id: string;
    contentKey: string;
    translations: {
      ru: string;
      he: string;
      en: string;
    };
  }>;
  styling: {
    font: string;
    size: number;
    color: string;
    weight: string;
    alignment: string;
  };
  position: {
    x: number;
    y: number;
  };
  lastModified: Date;
  status: string;
}

interface LocalContentApiResponse {
  status: string;
  screen_location: string;
  language_code: string;
  content_count: number;
  content: Record<string, {
    value: string | string[];
    component_type: string;
    category: string;
    language: string;
    status: string;
  }>;
}

// Action count mapping based on Confluence documentation
// This provides the real action counts until database migration is complete
const ACTION_COUNT_MAPPING: Record<string, number> = {
  // Page-level action counts from Confluence
  'page.mortgage.calculator': 15,        // Калькулятор ипотеки
  'page.personal.data.form': 23,         // Анкета личных данных
  'page.income.form': 22,                // Анкета доходов. Наемный работник
  'page.income.source.add': 9,           // Добавление источника дохода
  'page.additional.income.add': 5,       // Добавление доп источника дохода
  'page.debt.obligation.add': 7,         // Добавление долгового обязательства
  'page.mortgage.programs': 11,          // Выбор программ ипотеки
  'page.bank.details.description': 3,    // Детали банка. Описание
  'page.bank.details.conditions': 3,     // Детали банка. Условия
  
  // Component-level action counts
  'app.main.action.1': 3,  // Основной источник дохода
  'app.main.action.2': 4,  // Employment type
  'app.main.action.3': 5,  // Property type
  'app.main.action.4': 2,  // Loan purpose
  'app.main.action.5': 6,  // Credit history
  'app.main.action.6': 3,  // Document type
  'app.main.action.7': 4,  // Family status
  'app.main.action.8': 5,  // Education level
  'app.main.action.9': 3,  // Income stability
  'app.main.action.10': 2, // Bank account
  'app.main.action.11': 4, // Loan term
  'app.main.action.12': 3, // Payment method
  
  // Title-based mappings for content that appears in your table
  'калькулятор ипотеки': 15,
  'анкета личных данных': 23,
  'анкета доходов': 22,
  'добавление источника дохода': 9,
  'добавление доп источника дохода': 5,
  'добавление долгового обязательства': 7,
  'выбор программ ипотеки': 11,
  'детали банка': 3,
};

// Function to get action count for content item
const getActionCountForItem = (item: any): number => {
  // FIRST: Use database value if available (prioritize real data!)
  if (typeof item.actionCount === 'number') {
    return item.actionCount; // Allow 0 values for placeholder steps
  }
  
  if (typeof item.action_count === 'number') {
    return item.action_count; // Allow 0 values for placeholder steps
  }
  
  // Handle string values
  if (item.actionCount !== undefined && item.actionCount !== null) {
    return parseInt(item.actionCount) || 0;
  }
  
  if (item.action_count !== undefined && item.action_count !== null) {
    return parseInt(item.action_count) || 0;
  }
  
  // FALLBACK: Try exact match in hardcoded mapping
  if (item.content_key && ACTION_COUNT_MAPPING[item.content_key]) {
    return ACTION_COUNT_MAPPING[item.content_key];
  }
  
  // Try action number match
  const actionMatch = item.content_key?.match(/app\.main\.action\.(\d+)/);
  if (actionMatch) {
    const actionKey = `app.main.action.${actionMatch[1]}`;
    if (ACTION_COUNT_MAPPING[actionKey]) {
      return ACTION_COUNT_MAPPING[actionKey];
    }
  }
  
  // Try title-based matching (last resort)
  const title = item.title_ru || item.translations?.ru || item.title || '';
  if (title) {
    const lowerTitle = title.toLowerCase();
    for (const [key, count] of Object.entries(ACTION_COUNT_MAPPING)) {
      if (key.includes(' ') && lowerTitle.includes(key)) {
        return count;
      }
    }
  }
  
  // Default fallback
  return 1;
};

class ApiService {
  // Cache for content API responses with ETag support
  private contentCache = new Map<string, { 
    data: any; 
    etag: string; 
    timestamp: number; 
    ttl: number 
  }>();
  
  private readonly CACHE_TTL = CONTENT_CACHE_TTL; // Configurable TTL from environment

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Always use relative path for API calls to work with Vite proxy
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session management
        ...options,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Cached request method for content API with ETag support
  private async requestWithCache<T>(
    endpoint: string,
    options: RequestInit = {},
    customTTL?: number
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${endpoint}${JSON.stringify(options)}`;
    const cached = this.contentCache.get(cacheKey);
    const ttl = customTTL || this.CACHE_TTL;
    
    // Check cache validity
    const cacheValid = cached && (Date.now() - cached.timestamp) < cached.ttl;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(cacheValid && cached.etag ? { 'If-None-Match': cached.etag } : {}),
      ...options.headers,
    };
    
    try {
      // Use relative path for content endpoints since Vite proxy handles routing
      const baseUrl = endpoint.startsWith('/api/content') ? '' : API_BASE_URL;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for session management
      });
      
      // Handle 304 Not Modified - return cached data
      if (response.status === 304 && cached) {
        console.log('Cache hit (304 Not Modified):', cacheKey);
        return { success: true, data: cached.data };
      }
      
      const result = await response.json();
      const etag = response.headers.get('ETag');
      const cacheControl = response.headers.get('Cache-Control');
      const contentVersion = response.headers.get('Bankim-Content-Version');
      
      // Parse cache control for TTL
      let parsedTTL = ttl;
      if (cacheControl && cacheControl.includes('max-age=')) {
        const maxAge = cacheControl.match(/max-age=(\d+)/);
        if (maxAge) {
          parsedTTL = parseInt(maxAge[1]) * 1000; // Convert to milliseconds
        }
      }
      
      // Cache the response with metadata
      if (etag || contentVersion) {
        this.contentCache.set(cacheKey, {
          data: result.data,
          etag: etag || contentVersion || '',
          timestamp: Date.now(),
          ttl: parsedTTL
        });
        
        console.log('Cached response:', cacheKey, 'TTL:', parsedTTL);
      }
      
      return result;
      
    } catch (error) {
      // Return cached data on network error if available
      if (cached && (Date.now() - cached.timestamp) < cached.ttl * 2) {
        console.warn('Network error, using stale cache:', cacheKey);
        return { success: true, data: cached.data };
      }
      
      console.error('Cached request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Clear cache method
  clearContentCache(): void {
    this.contentCache.clear();
    console.log('Content cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: Array<{ key: string; age: number; hasEtag: boolean }> } {
    const entries = Array.from(this.contentCache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      hasEtag: !!value.etag
    }));
    
    return {
      size: this.contentCache.size,
      entries
    };
  }

  // Calculator Formula Operations
  async getCalculatorFormula(): Promise<ApiResponse<FormulaData>> {
    return this.request<FormulaData>('/api/calculator-formula');
  }

  async updateCalculatorFormula(formulaData: FormulaData): Promise<ApiResponse<FormulaData>> {
    return this.request<FormulaData>('/api/calculator-formula', {
      method: 'PUT',
      body: JSON.stringify(formulaData),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Database Info
  async getDbInfo(): Promise<ApiResponse<any>> {
    return this.request('/api/db-info');
  }

  // Bank Operations
  async getAllBanks(): Promise<ApiResponse<any[]>> {
    return this.request('/api/banks');
  }

  async getBankById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/banks/${id}`);
  }

  async getBankConfiguration(bankId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/banks/${bankId}/configuration`);
  }

  async saveBankConfiguration(bankId: number, configData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/banks/${bankId}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  async updateBankConfiguration(bankId: number, configData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/banks/${bankId}/configuration`, {
      method: 'PUT', 
      body: JSON.stringify(configData),
    });
  }

  // User Operations (existing)
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/users');
  }

  async getUserById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // UI Settings Operations
  async getUISettings(): Promise<ApiResponse<UISetting[]>> {
    return this.request<UISetting[]>('/api/ui-settings');
  }

  async getUISettingByKey(key: string): Promise<ApiResponse<UISetting>> {
    return this.request<UISetting>(`/api/ui-settings/${key}`);
  }

  async updateUISetting(key: string, value: string): Promise<ApiResponse<UISetting>> {
    return this.request<UISetting>(`/api/ui-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ settingValue: value }),
    });
  }

  // Content Management Operations
  async getContentItems(): Promise<ApiResponse<ContentItem[]>> {
    return this.request<ContentItem[]>('/api/content-items');
  }

  async getSitePages(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔄 Fetching site pages summary...');
      const response = await this.request<any[]>('/api/content/site-pages');
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched site pages from database');
        return response;
      } else {
        console.error('❌ Failed to fetch site pages:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching site pages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch site pages'
      };
    }
  }

  async getContentItemById(id: string): Promise<ApiResponse<ContentItem>> {
    console.log('🔍 getContentItemById called with id:', id);
    const result = await this.requestWithCache<ContentItem>(`/api/content/item/${id}`);
    console.log('📦 getContentItemById result:', result);
    return result;
  }

  async updateContentTranslation(
    contentItemId: string, 
    languageCode: string, 
    contentValue: string
  ): Promise<ApiResponse<ContentTranslation>> {
    const response = await this.request<ContentTranslation>(`/api/content-items/${contentItemId}/translations/${languageCode}`, {
      method: 'PUT',
      body: JSON.stringify({ content_value: contentValue }),
     });
    
    // Clear cache after successful translation update
    // This ensures subsequent API calls get fresh data with updated timestamps
    if (response.success) {
      console.log('🗑️ Clearing content cache after translation update');
      this.clearContentCache();
    }
    
    return response;
  }

  async getContentCategories(): Promise<ApiResponse<ContentCategory[]>> {
    return this.request<ContentCategory[]>('/api/content-categories');
  }

  async getLanguages(): Promise<ApiResponse<Language[]>> {
    return this.request<Language[]>('/api/languages');
  }

  async createContentItem(contentData: any): Promise<ApiResponse<ContentItem>> {
    return this.request<ContentItem>('/api/content-items', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async updateContentItem(contentItemId: string, updateData: { translations: { ru: string; he: string; en?: string } }): Promise<ApiResponse<any>> {
    try {
      console.log(`📝 Updating content item ${contentItemId} with translations:`, updateData.translations);
      
      const results = [];
      
      // Update Russian translation
      if (updateData.translations.ru !== undefined) {
        const ruResult = await this.updateContentTranslation(contentItemId, 'ru', updateData.translations.ru);
        results.push(ruResult);
        console.log(`🇷🇺 Russian translation update:`, ruResult.success ? '✅' : '❌', ruResult.error || '');
      }
      
      // Update Hebrew translation
      if (updateData.translations.he !== undefined) {
        const heResult = await this.updateContentTranslation(contentItemId, 'he', updateData.translations.he);
        results.push(heResult);
        console.log(`🇮🇱 Hebrew translation update:`, heResult.success ? '✅' : '❌', heResult.error || '');
      }
      
      // Update English translation if provided
      if (updateData.translations.en !== undefined) {
        const enResult = await this.updateContentTranslation(contentItemId, 'en', updateData.translations.en);
        results.push(enResult);
        console.log(`🇺🇸 English translation update:`, enResult.success ? '✅' : '❌', enResult.error || '');
      }
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.success);
      const errors = results.filter(result => !result.success).map(result => result.error);
      
      if (allSuccessful) {
        console.log(`✅ All translations updated successfully for content item ${contentItemId}`);
        return {
          success: true,
          data: { contentItemId, updatedTranslations: updateData.translations }
        };
      } else {
        console.error(`❌ Some translation updates failed for content item ${contentItemId}:`, errors);
        return {
          success: false,
          error: `Translation update failed: ${errors.join(', ')}`
        };
      }
    } catch (error) {
      console.error(`❌ Error updating content item ${contentItemId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Main Page Content Operations - following CSS example structure
  async getMainPageContent(): Promise<ApiResponse<LocalMainPageContent>> {
    try {
      // Fetch content using the correct API endpoint pattern
      const contentResponse = await this.getContentByScreen('main_page', 'ru');
      
      if (!contentResponse.success || !contentResponse.data) {
        throw new Error(contentResponse.error || 'Failed to fetch content');
      }
      
      const apiData = contentResponse.data;
      
      // Transform the API response to MainPageContent format
      const actions: MainPageAction[] = [];
      
      // Extract actions from content
      Object.entries(apiData.content).forEach(([key, value]) => {
        const actionMatch = key.match(/app\.main\.action\.(\d+)\.dropdown\./);
        if (actionMatch) {
          const actionNumber = parseInt(actionMatch[1]);
          actions.push({
            id: `action-${actionNumber}`,
            actionNumber,
            title: `${actionNumber}.${value.value}`,
            titleRu: typeof value.value === 'string' ? value.value : value.value[0],
            titleHe: '', // Will be filled from Hebrew response
            titleEn: '', // Will be filled from English response
            actionType: 'Дропдаун',
            status: value.status === 'approved' ? 'published' : 'draft',
            createdBy: 'content-manager',
            lastModified: new Date(),
            createdAt: new Date()
          });
        }
      });
      
      // Sort actions by number
      actions.sort((a, b) => a.actionNumber - b.actionNumber);
      
      // Get page title from content
      const pageTitle = apiData.content['app.main.page.title']?.value || 'Калькулятор ипотеки Страница №2';
      
      const mainPageContent: LocalMainPageContent = {
        pageTitle: typeof pageTitle === 'string' ? pageTitle : pageTitle[0],
        actionCount: actions.length,
        lastModified: new Date().toLocaleDateString('ru-RU') + ' | ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        actions,
        galleryImages: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMTwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMjwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMzwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNDwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNTwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1saXNpdGl6ZT0iMjQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7QodGC0YDQsNC90LjRhtCwIDY8L3RleHQ+PC9zdmc+'
        ]
      };
      
      return {
        success: true,
        data: mainPageContent
      };
      
    } catch (error) {
      console.error('Error fetching main page content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateMainPageAction(actionId: string, actionData: Partial<MainPageAction>): Promise<ApiResponse<MainPageAction>> {
    // Check for placeholder URLs and return success for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, simulating update action for development');
      return {
        success: true,
        data: {
          id: actionId,
          actionNumber: 1,
          title: '1.Основной источник дохода',
          titleRu: 'Рассчитать Ипотеку',
          titleHe: 'חשב את המשכנתא שלך',
          titleEn: 'Calculate Mortgage',
          actionType: 'Дропдаун',
          status: 'published',
          createdBy: 'director-1',
          lastModified: new Date(),
          createdAt: new Date(),
          ...actionData
        } as MainPageAction
      };
    }
    
    return this.request<MainPageAction>(`/api/content/main/actions/${actionId}`, {
      method: 'PUT',
      body: JSON.stringify(actionData),
    });
  }

  async createMainPageAction(actionData: Omit<MainPageAction, 'id' | 'createdAt' | 'lastModified'>): Promise<ApiResponse<MainPageAction>> {
    // Check for placeholder URLs and return success for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, simulating create action for development');
      return {
        success: true,
        data: {
          id: `income-main-${Date.now()}`,
          createdAt: new Date(),
          lastModified: new Date(),
          ...actionData
        } as MainPageAction
      };
    }
    
    return this.request<MainPageAction>('/api/content/main/actions', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  async deleteMainPageAction(actionId: string): Promise<ApiResponse<void>> {
    // Check for placeholder URLs and return success for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, simulating delete action for development');
      return { success: true };
    }
    
    return this.request<void>(`/api/content/main/actions/${actionId}`, {
      method: 'DELETE',
    });
  }

  // New Content API Integration - following bankim_content service patterns
  async getContentByScreen(screenLocation: string, languageCode: string): Promise<ApiResponse<LocalContentApiResponse>> {
    return this.requestWithCache<LocalContentApiResponse>(`/api/content/${screenLocation}/${languageCode}`);
  }

  async getContentByKey(contentKey: string, languageCode: string): Promise<ApiResponse<any>> {
    // Check for placeholder URLs and return mock data for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, returning mock content key data for development');
      return {
        success: true,
        data: {
          content_key: contentKey,
          value: 'Mock Content Value',
          language: languageCode,
          status: 'approved',
          fallback_used: false
        }
      };
    }
    
    return this.requestWithCache(`/api/content/${contentKey}/${languageCode}`);
  }

  async getAllMainPageLanguages(): Promise<ApiResponse<ContentPage[]>> {
    try {
      // Fetch content for all supported languages
      const languages = ['ru', 'he', 'en'];
      const responses = await Promise.allSettled(
        languages.map(lang => this.getContentByScreen('main_page', lang))
      );
      
      // Process successful responses
      const validResponses: LocalContentApiResponse[] = [];
      responses.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          validResponses.push(result.value.data);
        } else {
          console.warn(`Failed to fetch content for language: ${languages[index]}`, 
                      result.status === 'rejected' ? result.reason : result.value.error);
        }
      });
      
      if (validResponses.length === 0) {
        throw new Error('No content data available for any language');
      }
      
      // Transform API responses to ContentPage format
      const contentPages = this.transformApiToContentPages(validResponses);
      
      return {
        success: true,
        data: contentPages
      };
      
    } catch (error) {
      console.error('Error fetching main page content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getMainPageAction(actionId: string): Promise<ApiResponse<MainPageAction | null>> {
    // Re-use existing logic: fetch the multilingual main page content once and pick the required action.
    const pagesResp = await this.getMainPageContent();
    if (!pagesResp.success || !pagesResp.data) {
      return { success: false, error: pagesResp.error || 'Failed to load main page content' };
    }

    const found = pagesResp.data.actions.find(a => a.id === actionId || a.id === `action-${a.actionNumber}`);
    return { success: true, data: found || null };
  }

  async getDropdownOptions(actionNumber: number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/content/main_page/action/${actionNumber}/options`);
  }

  async getMortgageDropdownOptions(contentKey: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/content/mortgage/${encodeURIComponent(contentKey)}/options`);
  }

  async getMortgageRefiDropdownOptions(contentKey: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/content/mortgage-refi/${encodeURIComponent(contentKey)}/options`);
  }

  async getCreditDropdownOptions(contentKey: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/content/credit/${encodeURIComponent(contentKey)}/options`);
  }

  async getCreditRefiDropdownOptions(contentKey: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/content/credit-refi/${encodeURIComponent(contentKey)}/options`);
  }

  // Generic content operations - handles any content type
  async getContentByType(contentType: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching ${contentType} content from database...`);
      const response = await this.requestWithCache<any>(`/api/content/${contentType}`);
      
      if (response.success && response.data) {
        console.log(`✅ Successfully fetched ${contentType} content from database`);
        return response;
      } else {
        console.error(`❌ Failed to fetch ${contentType} content:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error fetching ${contentType} content:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch ${contentType} content`
      };
    }
  }

  async getAllItemsByType(contentType: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching all individual ${contentType} content items...`);
      const response = await this.requestWithCache<any>(`/api/content/${contentType}/all-items`);
      
      if (response.success && response.data) {
        console.log(`✅ Successfully fetched all ${contentType} items`);
        return response;
      } else {
        console.error(`❌ Failed to fetch all ${contentType} items:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error fetching all ${contentType} items:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch all ${contentType} items`
      };
    }
  }

  // Mortgage content operations
  async getMortgageContent(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching mortgage content from database...');
      const response = await this.requestWithCache<any>(`/api/content/mortgage`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched mortgage content from database');
        return response;
      } else {
        console.error('❌ Failed to fetch mortgage content:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching mortgage content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch mortgage content'
      };
    }
  }

  async getMortgageRefiContent(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching mortgage-refi content from database...');
      const response = await this.requestWithCache<any>(`/api/content/mortgage-refi`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched mortgage-refi content from database');
        return response;
      } else {
        console.error('❌ Failed to fetch mortgage-refi content:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching mortgage-refi content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch mortgage-refi content'
      };
    }
  }

  async getCreditContent(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching credit content from database...');
      const response = await this.requestWithCache<any>(`/api/content/credit`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched credit content from database');
        return response;
      } else {
        console.error('❌ Failed to fetch credit content:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching credit content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch credit content'
      };
    }
  }

  async updateMortgageContent(contentId: string, updateData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Updating mortgage content...', { contentId, updateData });
      const response = await this.request<any>(`/api/content/mortgage/${encodeURIComponent(contentId)}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (response.success) {
        console.log('✅ Successfully updated mortgage content');
        // Cache will be automatically refreshed on next fetch
        return response;
      } else {
        console.error('❌ Failed to update mortgage content:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error updating mortgage content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update mortgage content'
      };
    }
  }

  async getMortgageAllItems(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching all individual mortgage content items...');
      const response = await this.requestWithCache<any>(`/api/content/mortgage/all-items`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched all mortgage items');
        return response;
      } else {
        console.error('❌ Failed to fetch all mortgage items:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching all mortgage items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch all mortgage items'
      };
    }
  }

  async getMortgageRefiAllItems(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching all individual mortgage-refi content items...');
      const response = await this.requestWithCache<any>(`/api/content/mortgage-refi/all-items`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched all mortgage-refi items');
        return response;
      } else {
        console.error('❌ Failed to fetch all mortgage-refi items:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching all mortgage-refi items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch all mortgage-refi items'
      };
    }
  }

  // Menu content operations - using real bankim_content database
  async getMenuContent(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching menu content from database...');
      const response = await this.requestWithCache<any>(`/api/content/menu`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched menu content from database');
        return response;
      } else {
        console.error('❌ Failed to fetch menu content:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching menu content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch menu content'
      };
    }
  }

  async getMenuTranslations(): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Fetching menu translations from bankim_content database...');
      
      // Fetch real data from bankim_content database
      const response = await this.requestWithCache<any>(`/api/content/menu/translations`);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched menu translations from database:', response.data);
        return response;
      } else {
        console.error('❌ Failed to fetch menu translations:', response.error);
        return {
          success: false,
          error: response.error || 'Failed to fetch menu translations from database'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching menu translations from bankim_content:', error);
      return {
        success: false,
        error: 'Database connection error: ' + (error as Error).message
      };
    }
  }

  async updateMenuTranslation(contentItemId: string, languageCode: string, contentValue: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/content-items/${contentItemId}/translations/${languageCode}`, {
      method: 'PUT',
      body: JSON.stringify({ content_value: contentValue }),
    });
  }

  /**
   * Get content by content type for filtered views
   * This method provides content filtering for different content sections
   * following Confluence Page 3 specification
   * @param contentType - Type of content to filter by (mortgage, credit, etc.)
   * @returns Promise with filtered content data
   */
  async getContentByContentType(contentType: string): Promise<ApiResponse<ContentListItem[]>> {
    try {
      // Clear cache for content endpoints to ensure fresh data
      if (contentType === 'credit') {
        this.clearContentCache();
      }
      
      // Map content type to database screen_location
      const screenLocationMap: Record<string, string> = {
        'mortgage': 'mortgage_calculation',
        'mortgage-refi': 'mortgage_refinancing',
        'credit': 'credit_calculation',
        'credit-refi': 'credit_refinancing',
        'general': 'general_pages',
        'menu': 'navigation_menu'
      };

      const screenLocation = screenLocationMap[contentType];
      
      if (!screenLocation) {
        console.error(`Unknown content type: ${contentType}`);
        return {
          success: false,
          error: `Unknown content type: ${contentType}`,
          data: []
        };
      }

      // Try to fetch real data from the database
      console.log(`🔄 Fetching ${contentType} content from database...`);
      
      // Test direct fetch first to compare
      try {
        const directResponse = await fetch(`/api/content/${contentType}`, {
          credentials: 'include'
        });
        const directResult = await directResponse.json();
        console.log(`🔗 Direct fetch result for ${contentType}:`, directResult);
      } catch (e) {
        console.log(`❌ Direct fetch failed:`, e);
      }
      
      const response = await this.requestWithCache<any>(`/api/content/${contentType}`);
      
      console.log(`📊 API Response for ${contentType}:`, response);
      console.log(`📊 Response success:`, response.success);
      console.log(`📊 Response data:`, response.data);
      console.log(`📊 Response data keys:`, response.data ? Object.keys(response.data) : 'no data');
      
      if (response.success && response.data) {
        // Handle different response structures based on content type
        let contentArray: any[] = [];
        
        if (contentType === 'mortgage' && response.data.mortgage_content) {
          contentArray = response.data.mortgage_content;
          console.log(`✅ Found mortgage_content:`, contentArray.length);
        } else if (contentType === 'mortgage-refi' && response.data.mortgage_refi_items) {
          contentArray = response.data.mortgage_refi_items;
          console.log(`✅ Found mortgage_refi_items:`, contentArray.length);
        } else if (contentType === 'credit' && response.data.credit_content) {
          contentArray = response.data.credit_content;
          console.log(`✅ Found credit_content:`, contentArray.length);
          console.log(`🔍 Credit content first item:`, contentArray[0]);
        } else if (contentType === 'credit-refi' && response.data.credit_refi_items) {
          contentArray = response.data.credit_refi_items;
          console.log(`✅ Found credit_refi_items:`, contentArray.length);
        } else if (contentType === 'general' && response.data.general_content) {
          contentArray = response.data.general_content;
          console.log(`✅ Found general_content:`, contentArray.length);
        } else if (contentType === 'menu' && response.data.menu_items) {
          contentArray = response.data.menu_items;
          console.log(`✅ Found menu_items:`, contentArray.length);
        } else if (Array.isArray(response.data)) {
          contentArray = response.data;
          console.log(`✅ Found direct array data:`, contentArray.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          contentArray = response.data.data;
          console.log(`✅ Found nested data array:`, contentArray.length);
        } else if (response.data.items && Array.isArray(response.data.items)) {
          contentArray = response.data.items;
          console.log(`✅ Found items array:`, contentArray.length);
        } else {
          console.log(`❌ No matching data structure found for ${contentType}`);
          console.log(`❌ Available keys:`, Object.keys(response.data || {}));
          console.log(`❌ Response data structure:`, response.data);
        }
        
        console.log(`📋 Final contentArray length:`, contentArray.length);
        
        if (contentArray.length > 0) {
          // Transform database response to ContentListItem format
          const items: ContentListItem[] = contentArray.map((item: any, index: number) => {
            // Get the title
            const title = item.translations?.ru || item.title_ru || item.content_key || `Item ${index + 1}`;
            
            // Extract page number from title if it starts with a number pattern (e.g., "2.", "4.", "7.1", "11.2")
            let pageNumber = item.page_number || index + 1;
            const pageMatch = title.match(/^(\d+(?:\.\d+)?)\./);
            if (pageMatch) {
              pageNumber = parseFloat(pageMatch[1]);
            }
            
            // Determine content type from various sources
            let contentTypeValue: 'text' | 'dropdown' | 'link' | 'mixed' = 'text';
            
            // First check component_type field from database
            if (item.component_type) {
              const compType = item.component_type.toLowerCase();
              if (compType === 'dropdown' || compType === 'select' || compType.includes('dropdown')) {
                contentTypeValue = 'dropdown';
              } else if (compType === 'link' || compType === 'button' || compType.includes('link')) {
                contentTypeValue = 'link';
              } else if (compType === 'text' || compType.includes('text')) {
                contentTypeValue = 'text';
              } else if (compType === 'mixed' || compType.includes('mixed')) {
                contentTypeValue = 'mixed';
              } else if (compType === 'field_label') {
                // Field labels in mortgage content are dropdowns
                // Check content_key for known dropdown patterns
                const contentKey = item.content_key || '';
                if (contentKey.includes('.field.')) {
                  // Known dropdown fields in mortgage calculation
                  const dropdownFields = [
                    'main_source', 'type', 'bank', 'borrowers', 'children18',
                    'citizenship', 'city', 'debt_types', 'education', 'family_status',
                    'first_home', 'has_additional', 'how_much_childrens', 'is_foreigner',
                    'is_medinsurance', 'is_public', 'partner_pay_mortgage', 'property_ownership',
                    'sphere', 'when_needed'
                  ];
                  
                  // Check if this field is a known dropdown
                  const isDropdownField = dropdownFields.some(field => contentKey.includes(field));
                  if (isDropdownField) {
                    contentTypeValue = 'dropdown';
                  }
                }
              }
            }
            
            // For mortgage content, also analyze based on title patterns
            if (contentType === 'mortgage') {
              const lowerTitle = title.toLowerCase();
              
              // Known patterns for different content types in mortgage flow
              if (lowerTitle.includes('калькулятор') || lowerTitle.includes('расчет')) {
                contentTypeValue = 'mixed'; // Calculator pages usually have mixed content
              } else if (lowerTitle.includes('выбор') || lowerTitle.includes('добавить партнера') || 
                         lowerTitle.includes('самозанятый') || lowerTitle.includes('пенсионер') ||
                         lowerTitle.includes('студент') || lowerTitle.includes('безработный')) {
                contentTypeValue = 'dropdown'; // Selection pages usually have dropdowns
              } else if (lowerTitle.includes('показать предложения') || lowerTitle.includes('отпуск без содержания')) {
                contentTypeValue = 'link'; // Action buttons
              } else if (lowerTitle.includes('личные данные') || lowerTitle.includes('анкета')) {
                contentTypeValue = 'mixed'; // Forms with various inputs
              }
            }
            
            // Count actions to determine if it might be mixed content
            const actionCount = getActionCountForItem(item);
            if (actionCount > 10 && contentTypeValue === 'text') {
              // Pages with many actions likely have mixed content
              contentTypeValue = 'mixed';
            }
            
            // Debug logging
            console.log(`Item ${index}: component_type=${item.component_type}, actionCount=${actionCount}, contentType=${contentTypeValue}, title=${title}`);
            
            return {
              id: item.id?.toString() || `item-${index}`,
              title: title,
              actionCount: getActionCountForItem(item),
              lastModified: item.last_modified || item.updated_at || new Date().toISOString(),
              contentType: contentTypeValue,
              pageNumber: pageNumber,
              // Preserve additional fields for content management
              confluence_num: item.confluence_num, // Preserve Confluence number
              screen_location: item.screen_location,
              content_key: item.content_key,
              component_type: item.component_type,
              category: item.category,
              description: item.description,
              is_active: item.is_active,
              translations: item.translations
            };
          });
          
          // Sort items by page number
          items.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
          
          console.log(`✅ Successfully fetched ${items.length} ${contentType} items from database`);
          return {
            success: true,
            data: items
          };
        }
      }
      
      // Return empty array if real API fails or returns empty
      console.warn(`Real API failed or empty for ${contentType}`);
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error(`Error fetching ${contentType} content:`, error);
      // Return error instead of mock data
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content',
        data: []
      };
    }
  }



  // Text editing API methods
  async getTextContent(actionId: string): Promise<ApiResponse<LocalTextContent | null>> {
    try {
      const response = await this.request<LocalTextContent>(`/api/content/text/${actionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching text content:', error);
      return { success: false, error: 'Failed to fetch text content' };
    }
  }

  async updateTextContent(actionId: string, textData: Partial<LocalTextContent>): Promise<ApiResponse<LocalTextContent>> {
    try {
      const response = await this.request<LocalTextContent>(`/api/content/text/${actionId}`, {
        method: 'PUT',
        body: JSON.stringify(textData),
      });
      return response;
    } catch (error) {
      console.error('Error updating text content:', error);
      return { success: false, error: 'Failed to update text content' };
    }
  }

  private transformApiToContentPages(apiResponses: LocalContentApiResponse[]): ContentPage[] {
    const contentMap = new Map<string, Partial<ContentPage>>();
    
    apiResponses.forEach(response => {
      if (response.content) {
        Object.entries(response.content).forEach(([contentKey, contentData]) => {
          // Extract action number from content_key pattern
          // Expected: app.main.action.{number}.dropdown.{name}
          const actionMatch = contentKey.match(/app\.main\.action\.(\d+)\./);
          if (actionMatch) {
            const actionNumber = parseInt(actionMatch[1]);
            const actionId = `action-${actionNumber}`;
            
            if (!contentMap.has(actionId)) {
              contentMap.set(actionId, {
                id: actionId,
                pageNumber: actionNumber,
                actionCount: 1, // Start with 1, will be incremented
                category: 'main',
                status: contentData.status === 'approved' ? 'published' : 'draft',
                createdAt: new Date('2024-12-01'),
                lastModified: new Date('2024-12-15'),
                createdBy: 'content-manager',
                modifiedBy: 'content-manager',
                url: `/dropdown-action-${actionNumber}`
              });
            }
            
            const page = contentMap.get(actionId)!;
            
            // Set titles based on language
            if (response.language_code === 'ru') {
              page.titleRu = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
              page.title = page.titleRu; // Primary title
            } else if (response.language_code === 'he') {
              page.titleHe = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
            } else if (response.language_code === 'en') {
              page.titleEn = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
            }
            
            // Set content type based on component type
            if (contentData.component_type === 'dropdown') {
              page.contentType = 'dropdown';
              // Count dropdown options for actionCount
              if (Array.isArray(contentData.value)) {
                page.actionCount = Math.max(page.actionCount || 1, contentData.value.length);
              }
            } else if (contentData.component_type === 'text') {
              page.contentType = 'text';
            } else if (contentData.component_type === 'link') {
              page.contentType = 'link';
            } else {
              page.contentType = 'mixed'; // For unknown or mixed content types
            }
          }
        });
      }
    });
    
    // Convert map to array and ensure all required fields are present
    return Array.from(contentMap.values())
      .filter(page => page.title) // Only include pages with titles
      .map(page => ({
        ...page,
        title: page.title || page.titleRu || page.titleEn || 'Untitled',
        actionCount: page.actionCount || 1
      } as ContentPage))
      .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
  }
  // ============================================
  // JSONB Dropdown Management Methods
  // ============================================

  /**
   * Get all available screens with dropdowns
   */
  async getDropdownScreens(): Promise<ApiResponse<Array<{ screen: string; dropdownCount: number }>>> {
    try {
      console.log('🔄 Fetching available dropdown screens...');
      const response = await this.request<any>('/api/admin/dropdown-screens');
      
      if (response.success && response.data) {
        console.log(`✅ Found ${response.data.length} screens with dropdowns`);
        return response;
      } else {
        console.error('❌ Failed to fetch dropdown screens:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error fetching dropdown screens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dropdown screens'
      };
    }
  }

  /**
   * Get all dropdowns for a specific screen
   */
  async getScreenDropdowns(screen: string, language: string = 'en'): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching dropdowns for screen: ${screen} (${language})...`);
      const response = await this.requestWithCache<any>(`/api/admin/dropdowns/${screen}/${language}`);
      
      if (response.success && response.data) {
        console.log(`✅ Successfully fetched ${response.data.length} dropdowns for ${screen}`);
        return response;
      } else {
        console.error(`❌ Failed to fetch dropdowns for ${screen}:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error fetching dropdowns for ${screen}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch dropdowns for ${screen}`
      };
    }
  }

  /**
   * Get single dropdown configuration by key
   */
  async getDropdownByKey(dropdownKey: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Fetching dropdown configuration: ${dropdownKey}...`);
      const response = await this.requestWithCache<any>(`/api/admin/dropdown/${dropdownKey}`);
      
      if (response.success && response.data) {
        console.log(`✅ Successfully fetched dropdown: ${dropdownKey}`);
        return response;
      } else {
        console.error(`❌ Failed to fetch dropdown ${dropdownKey}:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error fetching dropdown ${dropdownKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch dropdown ${dropdownKey}`
      };
    }
  }

  /**
   * Update dropdown configuration
   */
  async updateDropdown(dropdownKey: string, dropdownData: any): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Updating dropdown: ${dropdownKey}...`);
      
      const response = await this.request<any>(`/api/admin/dropdown/${dropdownKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dropdown_data: dropdownData })
      });
      
      if (response.success) {
        console.log(`✅ Successfully updated dropdown: ${dropdownKey}`);
        // Clear cache after successful update
        this.clearContentCache();
        return response;
      } else {
        console.error(`❌ Failed to update dropdown ${dropdownKey}:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error updating dropdown ${dropdownKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to update dropdown ${dropdownKey}`
      };
    }
  }

  /**
   * Create new dropdown configuration
   */
  async createDropdown(screenLocation: string, fieldName: string, dropdownData: any): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Creating new dropdown: ${screenLocation}_${fieldName}...`);
      
      const response = await this.request<any>('/api/admin/dropdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screen_location: screenLocation,
          field_name: fieldName,
          dropdown_data: dropdownData
        })
      });
      
      if (response.success) {
        console.log(`✅ Successfully created dropdown: ${screenLocation}_${fieldName}`);
        // Clear cache after successful creation
        this.clearContentCache();
        return response;
      } else {
        console.error(`❌ Failed to create dropdown:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error creating dropdown:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dropdown'
      };
    }
  }

  /**
   * Delete dropdown (soft delete)
   */
  async deleteDropdown(dropdownKey: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Deleting dropdown: ${dropdownKey}...`);
      
      const response = await this.request<any>(`/api/admin/dropdown/${dropdownKey}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        console.log(`✅ Successfully deleted dropdown: ${dropdownKey}`);
        // Clear cache after successful deletion
        this.clearContentCache();
        return response;
      } else {
        console.error(`❌ Failed to delete dropdown ${dropdownKey}:`, response.error);
        return response;
      }
    } catch (error) {
      console.error(`❌ Error deleting dropdown ${dropdownKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to delete dropdown ${dropdownKey}`
      };
    }
  }

  /**
   * Validate dropdown data structure
   */
  async validateDropdownData(dropdownData: any): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    try {
      console.log('🔄 Validating dropdown data structure...');
      
      const response = await this.request<any>('/api/admin/dropdown/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dropdown_data: dropdownData })
      });
      
      if (response.success) {
        console.log('✅ Dropdown data validation complete');
        return response;
      } else {
        console.error('❌ Dropdown data validation failed:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Error validating dropdown data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate dropdown data'
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export cache utilities for debugging
export const clearContentCache = () => apiService.clearContentCache();
export const getContentCacheStats = () => apiService.getCacheStats();
export type { 
  LocalMainPageContent,
  MainPageAction,
  LocalTextContent,
  // Re-export shared types for backward compatibility
  ContentItem,
  ContentTranslation,
  FormulaData,
  UISetting,
  Language,
  ContentCategory,
  TextContent
}; 