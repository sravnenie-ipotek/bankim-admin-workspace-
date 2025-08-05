export interface ContentTranslation {
  language_code: string;
  content_value: string;
  status: string;
  is_default: boolean;
}

export interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: Record<string, string> | ContentTranslation[];
}
