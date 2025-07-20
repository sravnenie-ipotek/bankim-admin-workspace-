/**
 * API Service for BankIM Management Portal
 * Centralized API calls for all backend operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Detect placeholder API URLs and disable API calls for development
const isPlaceholderUrl = (url: string): boolean => {
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

class ApiService {
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
}

// Export singleton instance
export const apiService = new ApiService();
export type { 
  FormulaData, 
  ApiResponse, 
  UISetting, 
  ContentItem, 
  ContentTranslation, 
  Language, 
  ContentCategory,
  MainPageContent,
  MainPageAction
}; 