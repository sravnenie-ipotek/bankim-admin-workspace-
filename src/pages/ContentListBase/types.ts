/**
 * Simplified interface for content list display
 * Avoids complex ContentPage requirements while providing needed data
 */
export interface ContentListItem {
  id: string;
  title: string;
  actionCount: number;
  lastModified: string; // ISO date string for simpler handling
  contentType: 'text' | 'dropdown' | 'link' | 'mixed';
  pageNumber: number;
  // Additional fields for content management functionality
  screen_location?: string;
  content_key?: string;
  component_type?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
  translations?: {
    ru?: string;
    he?: string;
    en?: string;
  };
}

/**
 * API response for content list data
 */
export interface ContentListResponse {
  success: boolean;
  data?: ContentListItem[];
  error?: string;
} 