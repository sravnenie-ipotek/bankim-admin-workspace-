/**
 * ContentMain Component
 * Main content navigation hub for "Контент сайта" (Page 3 from Confluence)
 * 
 * Features:
 * - Navigation hub showing all content sections
 * - Simple card-based layout with action counts
 * - Links to specific content section pages
 * - Dark theme design matching system standards
 * 
 * Reference: Confluence Page 138903604 - "3. Контент сайта. Контент-менеджер/Копирайтер. Стр.3"
 * Figma: https://www.figma.com/file/Eenpc3kJRZHhxQNB2lkOxa/AP-node-id=128-127736
 * 
 * @version 2.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentMain.css';

/**
 * Content section interface for navigation cards
 */
interface ContentSection {
  id: string;
  title: string;
  description: string;
  actionCount: number;
  lastModified: string;
  path: string;
  category: string;
}

const ContentMain: React.FC = () => {
  const navigate = useNavigate();

  // Content sections based on Confluence Page 3 specification
  const contentSections: ContentSection[] = [
    {
      id: 'main',
      title: 'Главная',
      description: 'Основная страница сайта',
      actionCount: 7,
      lastModified: '15.12.2024, 02:00',
      path: '#', // TODO: Implement main page editing
      category: 'Главная'
    },
    {
      id: 'menu',
      title: 'Меню',
      description: 'Навигационное меню сайта',
      actionCount: 17,
      lastModified: '15.12.2024, 02:00',
      path: '/content/menu',
      category: 'Навигация'
    },
    {
      id: 'mortgage',
      title: 'Рассчитать ипотеку',
      description: 'Калькулятор ипотечных кредитов',
      actionCount: 12,
      lastModified: '15.12.2024, 02:00',
      path: '/content/mortgage',
      category: 'Ипотека'
    },
    {
      id: 'mortgage-refi',
      title: 'Рефинансирование ипотеки',
      description: 'Перекредитование ипотечных займов',
      actionCount: 8,
      lastModified: '15.12.2024, 02:00',
      path: '/content/mortgage-refi',
      category: 'Ипотека'
    },
    {
      id: 'credit',
      title: 'Расчет кредита',
      description: 'Калькулятор потребительских кредитов',
      actionCount: 15,
      lastModified: '15.12.2024, 02:00',
      path: '/content/credit',
      category: 'Кредитование'
    },
    {
      id: 'credit-refi',
      title: 'Рефинансирование кредита',
      description: 'Перекредитование потребительских займов',
      actionCount: 6,
      lastModified: '15.12.2024, 02:00',
      path: '/content/credit-refi',
      category: 'Кредитование'
    },
    {
      id: 'general',
      title: 'Общие страницы',
      description: 'Статические страницы и общая информация',
      actionCount: 23,
      lastModified: '15.12.2024, 02:00',
      path: '/content/general',
      category: 'Общие'
    }
  ];

  /**
   * Handle navigation to content section
   */
  const handleSectionClick = (section: ContentSection) => {
    if (section.path === '#') {
      alert('Данная секция находится в разработке');
      return;
    }
    navigate(section.path);
  };

  return (
    <div className="content-main">
      {/* Page Header */}
      <div className="content-main__header">
        <h1 className="content-main__title">Контент сайта</h1>
        <div className="content-main__breadcrumb">
          <span className="breadcrumb-item">Контент сайта</span>
        </div>
      </div>

      {/* Content Sections Grid */}
      <div className="content-main__sections">
        <h2 className="content-main__section-title">
          Список страниц
          <span className="content-main__badge">{contentSections.length}</span>
        </h2>
        
        <div className="content-main__grid">
          {contentSections.map((section) => (
            <div 
              key={section.id}
              className="content-section-card"
              onClick={() => handleSectionClick(section)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSectionClick(section);
                }
              }}
            >
              {/* Card Header */}
              <div className="section-card__header">
                <h3 className="section-card__title">{section.title}</h3>
                <span className="section-card__category">{section.category}</span>
              </div>

              {/* Card Content */}
              <div className="section-card__content">
                <p className="section-card__description">{section.description}</p>
                
                <div className="section-card__stats">
                  <div className="section-card__stat">
                    <span className="stat__label">Количество действий</span>
                    <span className="stat__value">{section.actionCount}</span>
                  </div>
                  
                  <div className="section-card__stat">
                    <span className="stat__label">Последнее изменение</span>
                    <span className="stat__value">{section.lastModified}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="section-card__footer">
                <span className="section-card__link">
                  Перейти к редактированию
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentMain;