export interface ContentTranslation {
  id?: number;
  content_id?: number;
  language_code: string;
  content_value: string;
  status?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContentItem {
  id: string | number;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations: Record<string, string> | ContentTranslation[];
  page_number?: number;
  action_count?: number;
  drill_action_count?: number;
}

export interface DropdownOption {
  id: number;
  content_id: number;
  option_value: string;
  option_key: string;
  display_text: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface FormulaData {
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

export interface UISetting {
  id: number;
  settingKey: string;
  settingValue: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentCategory {
  id: number;
  category_name: string;
  description?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}
