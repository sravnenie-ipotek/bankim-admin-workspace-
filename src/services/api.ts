/**
 * API Service for BankIM Management Portal
 * Centralized API calls for all backend operations
 */

import { ContentPage } from '../pages/Chat/ContentManagement/types/contentTypes';
import { ContentListItem } from '../pages/ContentListBase/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CONTENT_API_URL = import.meta.env.VITE_CONTENT_API_URL || API_BASE_URL;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FormulaData {
  minTerm: string;
  maxTerm: string;
  financingPercentage: string;
  bankInterestRate: string;
  baseInterestRate: string;
  variableInterestRate: string;
  interestChangePeriod: string;
  inflationIndex: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UISetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentTranslation {
  language_code: string;
  content_value: string;
  status: string;
  is_default: boolean;
}

interface ContentItem {
  id: string;
  content_key: string;
  content_type: string;
  category: string;
  screen_location: string;
  component_type: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: ContentTranslation[];
}

interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string;
  direction: string;
  is_active: boolean;
  is_default: boolean;
}

interface ContentCategory {
  id: number;
  name: string;
  display_name: string;
  description: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
}

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

interface MainPageContent {
  pageTitle: string;           // "Калькулятор ипотеки Страница №2" (CSS line 160)
  actionCount: number;         // 33 (CSS line 172)
  lastModified: string;        // "01.08.2023 | 15:03" (CSS line 180)
  actions: MainPageAction[];   // 12 items (CSS lines 264-342)
  galleryImages: string[];     // Page state images (CSS lines 189-227)
}

// bankim_content API Response Structure
interface ContentApiResponse {
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

interface TextContent {
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

class ApiService {
  // Cache for content API responses with ETag support
  private contentCache = new Map<string, { 
    data: any; 
    etag: string; 
    timestamp: number; 
    ttl: number 
  }>();
  
  private readonly CACHE_TTL = CONTENT_CACHE_TTL; // Configurable TTL from environment

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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
      // Use CONTENT_API_URL for content endpoints, API_BASE_URL for others
      const baseUrl = endpoint.startsWith('/api/content') ? CONTENT_API_URL : API_BASE_URL;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
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

  async getContentItemById(id: string): Promise<ApiResponse<ContentItem>> {
    return this.request<ContentItem>(`/api/content-items/${id}`);
  }

  async updateContentTranslation(
    contentItemId: string, 
    languageCode: string, 
    contentValue: string
  ): Promise<ApiResponse<ContentTranslation>> {
    return this.request<ContentTranslation>(`/api/content-items/${contentItemId}/translations/${languageCode}`, {
      method: 'PUT',
      body: JSON.stringify({ content_value: contentValue }),
    });
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

  // Main Page Content Operations - following CSS example structure
  async getMainPageContent(): Promise<ApiResponse<MainPageContent>> {
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
      
      const mainPageContent: MainPageContent = {
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
  async getContentByScreen(screenLocation: string, languageCode: string): Promise<ApiResponse<ContentApiResponse>> {
    return this.requestWithCache<ContentApiResponse>(`/api/content/${screenLocation}/${languageCode}`);
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
      const validResponses: ContentApiResponse[] = [];
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

  // Menu translations operations - using real bankim_content database
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
      const response = await this.requestWithCache<any>(`/api/content/${contentType}`);
      
      if (response.success && response.data) {
        // Handle different response structures based on content type
        let contentArray: any[] = [];
        
        if (contentType === 'mortgage' && response.data.mortgage_content) {
          contentArray = response.data.mortgage_content;
        } else if (contentType === 'mortgage-refi' && response.data.mortgage_refi_content) {
          contentArray = response.data.mortgage_refi_content;
        } else if (contentType === 'credit' && response.data.credit_content) {
          contentArray = response.data.credit_content;
        } else if (contentType === 'credit-refi' && response.data.credit_refi_content) {
          contentArray = response.data.credit_refi_content;
        } else if (contentType === 'menu' && response.data.menu_items) {
          contentArray = response.data.menu_items;
        } else if (Array.isArray(response.data)) {
          contentArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          contentArray = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          contentArray = response.data.items;
        }
        
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
            const actionCount = item.action_count || 1;
            if (actionCount > 10 && contentTypeValue === 'text') {
              // Pages with many actions likely have mixed content
              contentTypeValue = 'mixed';
            }
            
            // Debug logging
            console.log(`Item ${index}: component_type=${item.component_type}, actionCount=${actionCount}, contentType=${contentTypeValue}, title=${title}`);
            
            return {
              id: item.id?.toString() || `item-${index}`,
              title: title,
              actionCount: item.action_count || 1,
              lastModified: item.last_modified || item.updated_at || new Date().toISOString(),
              contentType: contentTypeValue,
              pageNumber: pageNumber
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
  async getTextContent(actionId: string): Promise<ApiResponse<TextContent | null>> {
    try {
      const response = await this.request<TextContent>(`/api/content/text/${actionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching text content:', error);
      return { success: false, error: 'Failed to fetch text content' };
    }
  }

  async updateTextContent(actionId: string, textData: Partial<TextContent>): Promise<ApiResponse<TextContent>> {
    try {
      const response = await this.request<TextContent>(`/api/content/text/${actionId}`, {
        method: 'PUT',
        body: JSON.stringify(textData),
      });
      return response;
    } catch (error) {
      console.error('Error updating text content:', error);
      return { success: false, error: 'Failed to update text content' };
    }
  }

  private transformApiToContentPages(apiResponses: ContentApiResponse[]): ContentPage[] {
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
}

// Export singleton instance
export const apiService = new ApiService();

// Export cache utilities for debugging
export const clearContentCache = () => apiService.clearContentCache();
export const getContentCacheStats = () => apiService.getCacheStats();
export type { 
  FormulaData, 
  ApiResponse, 
  UISetting, 
  ContentItem, 
  ContentTranslation, 
  Language, 
  ContentCategory,
  MainPageContent,
  MainPageAction,
  ContentApiResponse,
  TextContent
}; 