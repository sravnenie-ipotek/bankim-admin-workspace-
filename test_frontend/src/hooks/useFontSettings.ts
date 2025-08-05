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
      
      // Check if we're in development mode with placeholder API URL
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes('your-api-domain.railway.app')) {
        // Use default settings in development when API is not configured
        setFontSettings(defaultFontSettings);
        setLoading(false);
        return;
      }
      
      const response = await apiService.getUISettings();
      
      if (response.success && response.data) {
        // Check if response.data is an array or object
        const settingsArray = Array.isArray(response.data) 
          ? response.data as UISetting[]
          : [];
          
        const newFontSettings = { ...defaultFontSettings };
        
        settingsArray.forEach((setting) => {
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
        // Fallback to default settings if API fails
        setFontSettings(defaultFontSettings);
      }
    } catch (err) {
      // Use default settings if API is unavailable
      setFontSettings(defaultFontSettings);
      console.warn('API unavailable, using default font settings:', err);
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