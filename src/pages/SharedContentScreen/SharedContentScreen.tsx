import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AdminLayout, ContentPageWrapper } from '../../components';
import { ContentListBase } from '../ContentListBase';
import ContentMain from '../ContentMain';
import ContentMenu from '../ContentMenu';
import ContentMortgage from '../ContentMortgage';

// Configuration for each content type
interface ContentTypeConfig {
  title: string;
  breadcrumbLabel: string;
  activeMenuItem: string;
  useContentListBase: boolean;
  customComponent?: React.ComponentType;
}

const contentTypeConfig: Record<string, ContentTypeConfig> = {
  'main': {
    title: 'Главная',
    breadcrumbLabel: 'Главная страница',
    activeMenuItem: 'content-main',
    useContentListBase: false,
    customComponent: ContentMain
  },
  'menu': {
    title: 'Меню',
    breadcrumbLabel: 'Меню навигации',
    activeMenuItem: 'content-menu',
    useContentListBase: false,
    customComponent: ContentMenu
  },
  'mortgage': {
    title: 'Рассчитать ипотеку',
    breadcrumbLabel: 'Расчет ипотеки',
    activeMenuItem: 'content-mortgage',
    useContentListBase: false,
    customComponent: ContentMortgage
  },
  'mortgage-refi': {
    title: 'Рефинансирование ипотеки',
    breadcrumbLabel: 'Рефинансирование ипотеки',
    activeMenuItem: 'content-mortgage-refi',
    useContentListBase: true
  },
  'credit': {
    title: 'Расчет Кредита',
    breadcrumbLabel: 'Расчет кредита',
    activeMenuItem: 'content-credit',
    useContentListBase: true
  },
  'credit-refi': {
    title: 'Рефинансирование кредита',
    breadcrumbLabel: 'Рефинансирование кредита',
    activeMenuItem: 'content-credit-refi',
    useContentListBase: true
  },
  'general': {
    title: 'Общие страницы',
    breadcrumbLabel: 'Общие страницы',
    activeMenuItem: 'content-general',
    useContentListBase: true
  }
};

/**
 * SharedContentScreen - A shared component for all content list pages
 * Dynamically renders the appropriate content based on the contentType URL parameter
 */
const SharedContentScreen: React.FC = () => {
  const { contentType } = useParams<{ contentType: string }>();

  // Handle special case for menu with optional menuItem parameter
  const actualContentType = contentType?.split('/')[0];
  
  // Validate content type
  if (!actualContentType || !contentTypeConfig[actualContentType]) {
    return <Navigate to="/content-management" replace />;
  }

  const config = contentTypeConfig[actualContentType];

  return (
    <AdminLayout title={config.title} activeMenuItem={config.activeMenuItem}>
      <ContentPageWrapper title={config.title}>
        {config.useContentListBase ? (
          <ContentListBase
            sectionTitle={config.title}
            contentType={actualContentType}
            breadcrumbItems={[
              { label: 'Контент сайта', isActive: false },
              { label: config.breadcrumbLabel, isActive: true }
            ]}
          />
        ) : (
          config.customComponent && <config.customComponent />
        )}
      </ContentPageWrapper>
    </AdminLayout>
  );
};

export default SharedContentScreen;