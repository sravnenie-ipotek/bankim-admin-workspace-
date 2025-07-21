/**
 * Content Management TypeScript Interfaces
 * Comprehensive type definitions for the Chat Content Management system
 * 
 * Purpose:
 * - Ensures type safety throughout the Content Management module
 * - Provides clear contracts for API interactions
 * - Enables better IDE support and compile-time error checking
 * 
 * Security Considerations:
 * - All user inputs must be validated against these interfaces
 * - Sensitive fields are properly typed and documented
 * - Date fields use Date objects for proper validation
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

/**
 * Content Page Entity
 * Represents a single page in the content management system
 * 
 * Security Notes:
 * - All string fields must be sanitized before storage
 * - URLs must be validated for security (no javascript: protocols)
 * - User inputs limited by maxLength constraints
 */
export interface ContentPage {
  /** Unique page identifier (UUID format recommended) */
  id: string;
  
  /** Page number for ordering and reference (must be unique) */
  pageNumber: number;
  
  /** Primary page title (sanitized for XSS prevention) */
  title: string;
  
  /** Russian language title (optional, max 255 chars) */
  titleRu?: string;
  
  /** Hebrew language title (optional, max 255 chars, RTL support) */
  titleHe?: string;
  
  /** English language title (optional, max 255 chars) */
  titleEn?: string;
  
  /** Number of actions/interactions on this page (non-negative integer) */
  actionCount: number;
  
  /** Last modification timestamp (ISO 8601 format) */
  lastModified: Date;
  
  /** ID of user who last modified this page (for audit trail) */
  modifiedBy: string;
  
  /** Page category for filtering and organization */
  category: ContentPageCategory;
  
  /** Publication status of the page */
  status: ContentPageStatus;
  
  /** Optional URL for the page (must be validated for security) */
  url?: string;
  
  /** Creation timestamp (ISO 8601 format) */
  createdAt: Date;
  
  /** ID of user who created this page */
  createdBy: string;
  
  /** Content type for determining editing interface */
  contentType?: ContentType;
  
  /** Additional metadata (flexible JSON structure) */
  metadata?: Record<string, unknown>;
}

/**
 * Content Types
 * Determines which editing interface to use
 * Based on Figma specifications and Confluence documentation
 */
export type ContentType = 
  | 'text'              // Текстовые элементы
  | 'dropdown'          // Dropdown элементы
  | 'link'              // Ссылки
  | 'mixed';            // Смешанный контент

/**
 * Content Page Categories
 * Predefined categories for content organization
 * Based on Confluence documentation requirements
 */
export type ContentPageCategory = 
  | 'main'              // Главная страница
  | 'menu'              // Меню
  | 'mortgage'          // Рассчитать ипотеку
  | 'mortgage-refi'     // Рефинансирование ипотеки
  | 'credit'            // Расчет кредита
  | 'credit-refi'       // Рефинансирование кредита
  | 'general'           // Общие страницы
  | 'other';            // Прочее

/**
 * Content Page Status
 * Publication and workflow status options
 */
export type ContentPageStatus = 
  | 'draft'             // Черновик
  | 'published'         // Опубликовано
  | 'archived'          // Архив
  | 'pending-review'    // Ожидает проверки
  | 'rejected';         // Отклонено

/**
 * Content Filter Configuration
 * Defines all possible filtering and search options
 * 
 * Security Notes:
 * - Search queries must be sanitized to prevent injection attacks
 * - Date ranges must be validated (from <= to)
 * - All enum values must be validated against allowed types
 */
export interface ContentFilter {
  /** Search query string (sanitized, max 255 chars) */
  searchQuery: string;
  
  /** Filter by category (validated against ContentPageCategory) */
  category?: ContentPageCategory;
  
  /** Filter by status (validated against ContentPageStatus) */
  status?: ContentPageStatus;
  
  /** Start date for date range filtering (inclusive) */
  dateFrom?: Date;
  
  /** End date for date range filtering (inclusive) */
  dateTo?: Date;
  
  /** Sort field selection */
  sortBy: ContentSortField;
  
  /** Sort direction */
  sortOrder: 'asc' | 'desc';
  
  /** Page number for pagination (1-based, minimum 1) */
  page?: number;
  
  /** Items per page (minimum 1, maximum 100) */
  limit?: number;
  
  /** Filter by user who modified (for audit purposes) */
  modifiedBy?: string;
}

/**
 * Available sort fields
 * Fields that can be used for sorting content pages
 */
export type ContentSortField = 
  | 'pageNumber'
  | 'title'
  | 'actionCount'
  | 'lastModified'
  | 'createdAt'
  | 'category'
  | 'status';

/**
 * Content Management Component Props
 * Props interface for the main ContentManagement component
 */
export interface ContentManagementProps {
  /** Initial filter configuration (optional) */
  initialFilter?: Partial<ContentFilter>;
  
  /** Callback when page selection changes */
  onPageSelect?: (page: ContentPage) => void;
  
  /** Callback when filter changes */
  onFilterChange?: (filter: ContentFilter) => void;
  
  /** Read-only mode flag */
  readonly?: boolean;
  
  /** Custom CSS class name */
  className?: string;
}

/**
 * API Response Interfaces
 * Type definitions for backend API responses
 */

/**
 * Paginated Content Pages Response
 * Standard format for paginated API responses
 */
export interface ContentPagesResponse {
  /** Array of content pages */
  data: ContentPage[];
  
  /** Pagination metadata */
  pagination: {
    /** Current page number (1-based) */
    currentPage: number;
    
    /** Total number of pages */
    totalPages: number;
    
    /** Total number of items */
    totalItems: number;
    
    /** Items per page */
    itemsPerPage: number;
    
    /** Whether there's a next page */
    hasNext: boolean;
    
    /** Whether there's a previous page */
    hasPrevious: boolean;
  };
  
  /** Applied filter configuration */
  filters: ContentFilter;
}

/**
 * API Error Response
 * Standard error response format
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details */
  details?: Record<string, unknown>;
  
  /** Request timestamp */
  timestamp: string;
  
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Content Statistics
 * Summary statistics for the content management dashboard
 */
export interface ContentStats {
  /** Total number of pages */
  totalPages: number;
  
  /** Pages by status */
  statusCounts: Record<ContentPageStatus, number>;
  
  /** Pages by category */
  categoryCounts: Record<ContentPageCategory, number>;
  
  /** Recent activity count (last 7 days) */
  recentActivity: number;
  
  /** Average actions per page */
  averageActions: number;
  
  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Content Action Log Entry
 * Represents an audit log entry for content changes
 */
export interface ContentActionLog {
  /** Unique log entry ID */
  id: string;
  
  /** Content page ID */
  pageId: string;
  
  /** Type of action performed */
  action: ContentActionType;
  
  /** User who performed the action */
  userId: string;
  
  /** User display name */
  userName: string;
  
  /** Action timestamp */
  timestamp: Date;
  
  /** Changes made (before/after values) */
  changes?: Record<string, { before: unknown; after: unknown }>;
  
  /** Additional action metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Content Action Types
 * All possible actions that can be performed on content
 */
export type ContentActionType = 
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'restore'
  | 'view'
  | 'export';

/**
 * Form Validation Rules
 * Validation constraints for form inputs
 */
export interface ContentValidationRules {
  title: {
    required: true;
    minLength: 1;
    maxLength: 255;
    pattern?: RegExp;
  };
  pageNumber: {
    required: true;
    minimum: 1;
    maximum: 9999;
    unique: true;
  };
  category: {
    required: true;
    allowedValues: ContentPageCategory[];
  };
  status: {
    required: true;
    allowedValues: ContentPageStatus[];
  };
  url: {
    required: false;
    maxLength: 2048;
    pattern: RegExp; // URL validation pattern
  };
}

/**
 * Export validation rules constant
 * Pre-defined validation rules for content management
 */
export const CONTENT_VALIDATION_RULES: ContentValidationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[^<>\"'&]*$/ // Basic XSS prevention pattern
  },
  pageNumber: {
    required: true,
    minimum: 1,
    maximum: 9999,
    unique: true
  },
  category: {
    required: true,
    allowedValues: [
      'main', 'menu', 'mortgage', 'mortgage-refi', 
      'credit', 'credit-refi', 'general', 'other'
    ]
  },
  status: {
    required: true,
    allowedValues: ['draft', 'published', 'archived', 'pending-review', 'rejected']
  },
  url: {
    required: false,
    maxLength: 2048,
    pattern: /^https?:\/\/[^\s<>\"']+$/i // Basic URL validation
  }
}; 