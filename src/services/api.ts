/**
 * API Service for BankIM Management Portal
 * Centralized API calls for all backend operations
 */

import { ContentPage } from '../pages/Chat/ContentManagement/types/contentTypes';

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
         url.includes('your-backend-domain.railway.app') ||
         url.includes('localhost:3001'); // Default fallback that likely doesn't exist
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
    // Check for placeholder URLs and return mock data for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, returning mock data for development');
      
      // Return mock data that matches CSS example structure
      const mockData: MainPageContent = {
        pageTitle: "Калькулятор ипотеки Страница №2",
        actionCount: 33,
        lastModified: "01.08.2023 | 15:03",
        actions: Array.from({ length: 12 }, (_, index) => ({
          id: `income-main-${index + 1}`,
          actionNumber: index + 1,
          title: `${index + 1}.Основной источник дохода`,
          titleRu: "Рассчитать Ипотеку",
          titleHe: "חשב את המשכנתא שלך",
          titleEn: "Calculate Mortgage",
          actionType: index % 3 === 0 ? "Дропдаун" : index % 3 === 1 ? "Ссылка" : "Текст",
          status: index === 2 || index === 7 ? 'draft' : 'published',
          createdBy: 'director-1',
          lastModified: new Date(2024, 11, 10 + index),
          createdAt: new Date(2024, 11, 1)
        })),
        galleryImages: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMTwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMjwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMzwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNDwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNTwvdGV4dD48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNjwvdGV4dD48L3N2Zz4='
        ]
      };
      
      return {
        success: true,
        data: mockData
      };
    }
    
    return this.request<MainPageContent>('/api/content/main');
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
    // Check for placeholder URLs and return mock data for development
    if (isPlaceholderUrl(API_BASE_URL)) {
      console.log('API URL is placeholder, returning mock content data for development');
      
      const mockResponse: ContentApiResponse = {
        status: 'success',
        screen_location: screenLocation,
        language_code: languageCode,
        content_count: 8,
        content: {
          'app.main.action.1.dropdown.income_source': {
            value: languageCode === 'ru' ? 'Основной источник дохода' : 
                   languageCode === 'he' ? 'מקור הכנסה עיקרי' : 'Primary Income Source',
            component_type: 'dropdown',
            category: 'dropdowns',
            language: languageCode,
            status: 'approved'
          },
          'app.main.action.2.dropdown.employment_type': {
            value: languageCode === 'ru' ? 'Тип занятости' : 
                   languageCode === 'he' ? 'סוג תעסוקה' : 'Employment Type',
            component_type: 'dropdown',
            category: 'dropdowns',
            language: languageCode,
            status: 'approved'
          },
          'app.main.action.3.dropdown.property_type': {
            value: languageCode === 'ru' ? 'Тип недвижимости' : 
                   languageCode === 'he' ? 'סוג נכס' : 'Property Type',
            component_type: 'dropdown',
            category: 'dropdowns',
            language: languageCode,
            status: 'approved'
          }
        }
      };
      
      return {
        success: true,
        data: mockResponse
      };
    }
    
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
            
            // Count dropdown options for actionCount
            if (contentData.component_type === 'dropdown' && Array.isArray(contentData.value)) {
              page.actionCount = Math.max(page.actionCount || 1, contentData.value.length);
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
  ContentApiResponse
}; 