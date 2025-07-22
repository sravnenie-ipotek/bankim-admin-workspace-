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
}

/**
 * API response for content list data
 */
export interface ContentListResponse {
  success: boolean;
  data?: ContentListItem[];
  error?: string;
} 