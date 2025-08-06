# = BankIM Content Management Portal - Server Side Integration Guide

> **Purpose**: Detailed integration plan for connecting `/content/main` with the `bankim_content` PostgreSQL service

## =Ë Current State Analysis

### **Existing API Infrastructure**
- **Base Service**: `src/services/api.ts` - Centralized API service with mock data fallback
- **API Base URL**: `VITE_API_URL` environment variable (defaults to `http://localhost:3001`)
- **Placeholder Detection**: Automatic fallback to mock data when real API unavailable
- **Content Interfaces**: Comprehensive TypeScript interfaces in `src/pages/Chat/ContentManagement/types/contentTypes.ts`

### **Data Transformation Required**
Current `ContentPage` interface needs mapping from `bankim_content` API responses:

```typescript
// Current Frontend Interface (ContentPage)
interface ContentPage {
  id: string;
  pageNumber: number;
  title: string;
  titleRu?: string;
  titleHe?: string; 
  titleEn?: string;
  actionCount: number;
  lastModified: Date;
  modifiedBy: string;
  category: ContentPageCategory;
  status: ContentPageStatus;
  url?: string;
  createdAt: Date;
  createdBy: string;
}

// bankim_content API Response Structure
{
  "status": "success",
  "screen_location": "main_page",
  "language_code": "ru",
  "content_count": 12,
  "content": {
    "app.main.action.1.dropdown.income_source": {
      "value": "A=>2=>9 8AB>G=8: 4>E>40",
      "component_type": "dropdown",
      "category": "dropdowns",
      "language": "ru",
      "status": "approved"
    }
  }
}
```

---

## <¯ Integration Strategy

### **Step 1: Extend API Service**

#### **1.1 Add Content API Methods**
Create new methods in `src/services/api.ts`:

```typescript
// Content API methods for bankim_content integration
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

// Add to ApiService class:
async getMainPageContent(languageCode: string = 'ru'): Promise<ApiResponse<ContentApiResponse>> {
  return this.request<ContentApiResponse>(`/api/content/main_page/${languageCode}`);
}

async getContentByKey(contentKey: string, languageCode: string): Promise<ApiResponse<any>> {
  return this.request(`/api/content/${contentKey}/${languageCode}`);
}

async getAllMainPageLanguages(): Promise<ApiResponse<ContentPage[]>> {
  // Fetch content for all languages and merge
  const languages = ['ru', 'he', 'en'];
  const responses = await Promise.all(
    languages.map(lang => this.getMainPageContent(lang))
  );
  
  // Transform and merge responses into ContentPage[] format
  return this.transformToContentPages(responses);
}
```

#### **1.2 Data Transformation Logic**
Create transformation functions:

```typescript
private transformToContentPages(apiResponses: ContentApiResponse[]): ContentPage[] {
  const contentMap = new Map<string, Partial<ContentPage>>();
  
  apiResponses.forEach(response => {
    if (response.content) {
      Object.entries(response.content).forEach(([contentKey, contentData]) => {
        // Extract action number from content_key pattern
        // app.main.action.{number}.dropdown.{name}
        const actionMatch = contentKey.match(/app\.main\.action\.(\d+)\./);
        if (actionMatch) {
          const actionNumber = parseInt(actionMatch[1]);
          const actionId = `action-${actionNumber}`;
          
          if (!contentMap.has(actionId)) {
            contentMap.set(actionId, {
              id: actionId,
              pageNumber: actionNumber,
              actionCount: 0, // Will be calculated
              category: 'main',
              status: contentData.status === 'approved' ? 'published' : 'draft',
              createdAt: new Date(), // TODO: Get from API if available
              lastModified: new Date(), // TODO: Get from API if available
              createdBy: 'system', // TODO: Get from API if available
              modifiedBy: 'system' // TODO: Get from API if available
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
          
          // Count dropdown options
          if (contentData.component_type === 'dropdown' && Array.isArray(contentData.value)) {
            page.actionCount = Math.max(page.actionCount || 0, contentData.value.length);
          }
        }
      });
    }
  });
  
  return Array.from(contentMap.values()) as ContentPage[];
}
```

### **Step 2: Update ContentMain Component**

#### **2.1 Replace Mock Data with API Calls**
Update `src/pages/ContentMain/ContentMain.tsx`:

```typescript
// Replace existing useEffect with real API integration
useEffect(() => {
  const fetchContentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAllMainPageLanguages();
      
      if (response.success && response.data) {
        setMockContentPages(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch content data');
      }
    } catch (err) {
      console.error('Error fetching content data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback to existing mock data on error
      // Keep existing mock data logic as fallback
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchContentData();
}, []);
```

#### **2.2 Add Caching Strategy**
Implement ETag-based caching:

```typescript
// Add to ApiService
private contentCache = new Map<string, { data: any; etag: string; timestamp: number }>();

private async requestWithCache<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const cacheKey = `${endpoint}${JSON.stringify(options)}`;
  const cached = this.contentCache.get(cacheKey);
  
  // Check cache validity (5 minutes)
  const cacheValid = cached && (Date.now() - cached.timestamp) < 300000;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(cacheValid && cached.etag ? { 'If-None-Match': cached.etag } : {}),
    ...options.headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 304 && cached) {
      // Not modified, return cached data
      return { success: true, data: cached.data };
    }
    
    const result = await response.json();
    const etag = response.headers.get('ETag');
    
    // Cache the response
    if (etag) {
      this.contentCache.set(cacheKey, {
        data: result.data,
        etag,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    // Return cached data on error if available
    if (cached) {
      console.warn('API request failed, using cached data');
      return { success: true, data: cached.data };
    }
    
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### **Step 3: Environment Configuration**

#### **3.1 Update Environment Variables**
Add to `.env` (create if doesn't exist):

```bash
# Content API Configuration
VITE_CONTENT_API_URL=https://bankim-content-api.railway.app
VITE_API_URL=https://bankim-management-api.railway.app

# Development fallback
VITE_USE_MOCK_DATA=false

# Cache configuration
VITE_CONTENT_CACHE_TTL=300000
```

#### **3.2 API URL Configuration Logic**
Update `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CONTENT_API_URL = import.meta.env.VITE_CONTENT_API_URL || API_BASE_URL;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Update placeholder detection
const isPlaceholderUrl = (url: string): boolean => {
  return USE_MOCK_DATA || 
         url.includes('your-api-domain.railway.app') || 
         url.includes('your-backend-domain.railway.app') ||
         url.includes('localhost:3001');
};
```

---

## = Content Key Mapping Strategy

### **Expected Content Key Patterns**
Based on the CSS examples and documentation, expect these patterns:

```
app.main.action.{number}.dropdown.{name}
app.main.action.{number}.title.{language}
app.main.action.{number}.description.{language}
app.main.page.title.{language}
app.main.page.metadata.{field}
```

### **Screen Location Strategy**
- **Main Page**: `screen_location = "main_page"`
- **Categories**: `category = "dropdowns"`, `"titles"`, `"metadata"`
- **Component Types**: `component_type = "dropdown"`, `"label"`, `"title"`

### **Language Mapping**
- **Russian**: `language_code = "ru"` (primary/default)
- **Hebrew**: `language_code = "he"` (RTL support)
- **English**: `language_code = "en"` (fallback)

---

## =¦ Implementation Steps

### **Phase 1: API Service Extension** ¡ High Priority
1.  Extend `ApiService` class with content-specific methods
2.  Add data transformation logic
3.  Implement caching with ETag support
4.  Add error handling with mock data fallback

### **Phase 2: ContentMain Integration** ¡ High Priority
1.  Replace mock data with real API calls
2.  Update error handling and loading states
3.  Add retry logic for failed requests
4.  Test with both real and mock data

### **Phase 3: Advanced Features** = Medium Priority
1. ó Real-time updates via webhooks
2. ó Content validation and sanitization
3. ó Offline support with service workers
4. ó Performance monitoring and analytics

### **Phase 4: Testing & Optimization** =Ê Medium Priority
1. ó Unit tests for data transformation
2. ó Integration tests with mock API
3. ó Performance testing with large datasets
4. ó Error scenario testing

---

##   Critical Considerations

### **Security Requirements**
- **Input Sanitization**: All content from API must be sanitized for XSS
- **CSRF Protection**: Use proper headers for state-changing operations
- **Authentication**: Implement JWT token handling for admin operations
- **Rate Limiting**: Respect API rate limits and implement backoff

### **Performance Considerations**
- **Caching Strategy**: Implement aggressive caching with ETag validation
- **Lazy Loading**: Load content on-demand for large datasets
- **Pagination**: Handle large content sets with proper pagination
- **Debouncing**: Debounce search and filter operations

### **Error Handling**
- **Graceful Degradation**: Always provide mock data fallback
- **User Feedback**: Clear error messages with retry options
- **Logging**: Comprehensive error logging for debugging
- **Recovery**: Automatic retry with exponential backoff

### **Data Consistency**
- **Validation**: Validate all data against TypeScript interfaces
- **Fallback Logic**: Language fallback (requested ’ default ’ English)
- **Status Mapping**: Map API status to frontend status consistently
- **Timestamp Handling**: Proper date parsing and timezone handling

---

## >ê Testing Strategy

### **Unit Tests Required**
- Data transformation functions
- Cache management logic
- Error handling scenarios
- Language fallback logic

### **Integration Tests Required**
- API service with mock responses
- ContentMain component with real data
- Error states and recovery
- Performance with large datasets

### **E2E Tests Required**
- Full content loading workflow
- Edit and confirm page navigation
- Real-time data updates
- Offline behavior

---

## =Ê Monitoring & Analytics

### **Key Metrics to Track**
- API response times
- Cache hit/miss ratios
- Error rates by endpoint
- Content loading performance
- User interaction patterns

### **Error Monitoring**
- Failed API requests
- Data transformation errors
- Cache invalidation issues
- User experience degradation

---

## = Migration Plan

### **Safe Migration Strategy**
1. **Parallel Development**: Keep mock data system as fallback
2. **Feature Flags**: Use environment variables to toggle real/mock data
3. **Gradual Rollout**: Enable real data for specific user groups first
4. **Monitoring**: Monitor all metrics during migration
5. **Rollback Plan**: Quick rollback to mock data if issues arise

### **Rollback Procedures**
- Set `VITE_USE_MOCK_DATA=true` in environment
- Deploy with mock data fallback activated
- Monitor system stability
- Investigate and fix root cause
- Re-enable real data integration

---

## =Ý Next Actions

### **Immediate (Day 1)**
1. Create API service extension methods
2. Implement data transformation logic
3. Add caching infrastructure
4. Test with mock bankim_content responses

### **Short-term (Week 1)**
1. Integrate with real bankim_content API
2. Test all error scenarios
3. Implement comprehensive logging
4. Deploy to staging environment

### **Medium-term (Month 1)**
1. Add real-time updates
2. Implement advanced caching
3. Add performance monitoring
4. Deploy to production

---

## =à Code Examples

### **Complete API Integration Example**

```typescript
// src/services/contentApiService.ts
import { apiService, ApiResponse } from './api';
import { ContentPage } from '../pages/Chat/ContentManagement/types/contentTypes';

export class ContentApiService {
  
  async getMainPageContent(): Promise<ApiResponse<ContentPage[]>> {
    try {
      // Fetch all language versions
      const languages = ['ru', 'he', 'en'];
      const responses = await Promise.allSettled(
        languages.map(lang => 
          apiService.request<ContentApiResponse>(`/api/content/main_page/${lang}`)
        )
      );
      
      // Process successful responses
      const validResponses = responses
        .filter((result): result is PromiseFulfilledResult<ApiResponse<ContentApiResponse>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data!);
      
      // Transform to ContentPage format
      const contentPages = this.transformToContentPages(validResponses);
      
      return {
        success: true,
        data: contentPages
      };
      
    } catch (error) {
      console.error('Error fetching main page content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private transformToContentPages(responses: ContentApiResponse[]): ContentPage[] {
    // Implementation details as shown above
    // ...
  }
}

export const contentApiService = new ContentApiService();
```

### **ContentMain Integration Example**

```typescript
// src/pages/ContentMain/ContentMain.tsx - Updated useEffect
useEffect(() => {
  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contentApiService.getMainPageContent();
      
      if (result.success && result.data) {
        setMockContentPages(result.data);
      } else {
        throw new Error(result.error || 'Failed to load content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Content loading error:', err);
      
      // Keep existing mock data as fallback
      console.log('Using mock data as fallback');
    } finally {
      setIsLoading(false);
    }
  };
  
  loadContent();
}, []);
```

---

*Last updated: 2025-01-21*  
*Integration contact: dev@bankim.online*