import { useState, useEffect } from 'react';
import { apiService, UISetting } from '../services/api';

interface FontSettings {
  menuFontFamily: string;
  menuMainFontWeight: string;
  menuSubFontWeight: string;
  menuMainFontSize: string;
  menuSubFontSize: string;
  menuLineHeight: string;
}

const defaultFontSettings: FontSettings = {
  menuFontFamily: 'Arimo',
  menuMainFontWeight: '500',
  menuSubFontWeight: '600',
  menuMainFontSize: '16px',
  menuSubFontSize: '14px',
  menuLineHeight: '1.5',
};

export const useFontSettings = () => {
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFontSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUISettings();
      
      if (response.success && response.data) {
        const settings = response.data as UISetting[];
        const newFontSettings = { ...defaultFontSettings };
        
        settings.forEach((setting) => {
          switch (setting.settingKey) {
            case 'menu_font_family':
              newFontSettings.menuFontFamily = setting.settingValue;
              break;
            case 'menu_main_font_weight':
              newFontSettings.menuMainFontWeight = setting.settingValue;
              break;
            case 'menu_sub_font_weight':
              newFontSettings.menuSubFontWeight = setting.settingValue;
              break;
            case 'menu_main_font_size':
              newFontSettings.menuMainFontSize = setting.settingValue;
              break;
            case 'menu_sub_font_size':
              newFontSettings.menuSubFontSize = setting.settingValue;
              break;
            case 'menu_line_height':
              newFontSettings.menuLineHeight = setting.settingValue;
              break;
          }
        });
        
        setFontSettings(newFontSettings);
      } else {
        setError('Failed to load font settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load font settings');
    } finally {
      setLoading(false);
    }
  };

  const updateFontSetting = async (key: string, value: string) => {
    try {
      const response = await apiService.updateUISetting(key, value);
      
      if (response.success && response.data) {
        // Reload settings to get the updated values
        await loadFontSettings();
        return true;
      } else {
        setError('Failed to update font setting');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update font setting');
      return false;
    }
  };

  useEffect(() => {
    loadFontSettings();
  }, []);

  return {
    fontSettings,
    loading,
    error,
    loadFontSettings,
    updateFontSetting,
  };
}; 