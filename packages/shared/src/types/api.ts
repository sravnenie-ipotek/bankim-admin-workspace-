export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ContentApiResponse {
  count: number;
  totalCount: number;
  status: string;
  message?: string;
  data: any[];
  error?: string;
  actions?: any[];
  dropdownOptions?: any[];
}

export interface TextContent {
  id: number;
  content_key: string;
  content_value: string;
  language_code: string;
  component_type: string;
  category: string;
  screen_location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentPageAction {
  id: string;
  title: string;
  button_text: string;
  action_type: 'drill' | 'text' | 'dropdown' | 'calculate';
  component_type: string;
  category: string;
  screen_location: string;
  page_number?: number;
  url?: string;
  is_active: boolean;
}

export interface MainPageContent {
  actions: ContentPageAction[];
  totalCount: number;
  status: string;
}
