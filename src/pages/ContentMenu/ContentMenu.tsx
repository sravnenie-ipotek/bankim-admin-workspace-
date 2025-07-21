/**
 * ContentMenu Component
 * Displays content for each menu category using existing database screens
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import Breadcrumb from '../Chat/ContentManagement/components/Breadcrumb/Breadcrumb';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMenu.css';

interface MenuContentData {
  menu_item: string;
  language_code: string;
  content_count: number;
  screen_locations: string[];
  content: Record<string, {
    value: string | string[];
    component_type: string;
    category: string;
    language: string;
    status: string;
    screen_location: string;
  }>;
}

// Menu item configuration
const MENU_ITEMS = {
  glavnaya: { name: 'Главная', description: 'Главная страница сайта' },
  mortgage: { name: 'Рассчитать ипотеку', description: 'Калькулятор ипотеки' },
  refinance: { name: 'Рефинансирование', description: 'Рефинансирование ипотеки' },
  credit: { name: 'Расчет Кредита', description: 'Кредитный калькулятор' },
  cooperation: { name: 'Сотрудничество', description: 'Информация о сотрудничестве' },
  general: { name: 'Общие страницы', description: 'Общие страницы и разделы' }
};

const ContentMenu: React.FC = () => {
  const { menuItem } = useParams<{ menuItem: string }>();
  const { setCurrentSubmenu } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuContentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-menu', 'Меню');
  }, [setCurrentSubmenu]);

  // Fetch menu content
  useEffect(() => {
    const fetchMenuContent = async () => {
      if (!menuItem || !MENU_ITEMS[menuItem as keyof typeof MENU_ITEMS]) {
        setError('Неизвестный раздел меню');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.getMenuContent(menuItem, selectedLanguage);
        if (response.success && response.data) {
          setMenuData(response.data);
        } else {
          setError(response.error || 'Ошибка загрузки данных');
        }
      } catch (err) {
        setError('Не удалось загрузить данные меню');
        console.error('Menu content fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuContent();
  }, [menuItem, selectedLanguage]);

  const currentMenuItem = MENU_ITEMS[menuItem as keyof typeof MENU_ITEMS];

  if (!currentMenuItem) {
    return (
      <div className="content-menu error">
        <p>Неизвестный раздел меню: {menuItem}</p>
      </div>
    );
  }

  return (
    <div className="content-menu">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Меню', href: '/content/menu' },
            { label: currentMenuItem.name, href: '#', isActive: true }
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-main">
          <h1>{currentMenuItem.name}</h1>
          <span className="page-subtitle">{currentMenuItem.description}</span>
        </div>

        {/* Language Selector */}
        <div className="language-selector">
          <button 
            className={`lang-btn ${selectedLanguage === 'ru' ? 'active' : ''}`}
            onClick={() => setSelectedLanguage('ru')}
          >
            RU
          </button>
          <button 
            className={`lang-btn ${selectedLanguage === 'he' ? 'active' : ''}`}
            onClick={() => setSelectedLanguage('he')}
          >
            HE
          </button>
          <button 
            className={`lang-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
            onClick={() => setSelectedLanguage('en')}
          >
            EN
          </button>
        </div>
      </div>

      {/* Content Display */}
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка содержимого...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
        </div>
      )}

      {menuData && (
        <div className="menu-content">
          {/* Stats */}
          <div className="content-stats">
            <div className="stat-item">
              <span className="stat-label">Всего элементов:</span>
              <span className="stat-value">{menuData.content_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Экраны:</span>
              <span className="stat-value">{menuData.screen_locations.join(', ')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Язык:</span>
              <span className="stat-value">{selectedLanguage.toUpperCase()}</span>
            </div>
          </div>

          {/* Content Items */}
          <div className="content-items">
            <h2>Содержимое ({menuData.content_count} элементов)</h2>
            
            {Object.entries(menuData.content).map(([key, item]) => (
              <div key={key} className="content-item">
                <div className="item-header">
                  <span className="item-key">{key}</span>
                  <div className="item-badges">
                    <span className={`badge type-${item.component_type}`}>
                      {item.component_type}
                    </span>
                    <span className="badge category">{item.category}</span>
                    <span className={`badge status-${item.status}`}>
                      {item.status}
                    </span>
                    <span className="badge screen">{item.screen_location}</span>
                  </div>
                </div>
                <div className="item-content">
                  {Array.isArray(item.value) ? (
                    <ul>
                      {item.value.map((val, idx) => (
                        <li key={idx}>{val}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMenu;