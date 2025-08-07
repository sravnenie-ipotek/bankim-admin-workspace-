import React from 'react';
import { ContentListBase } from '../ContentListBase';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * ContentGeneral component displays the general pages content section
 * following Confluence Page 3 specification for "Общие страницы"
 */
const ContentGeneral: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <ContentListBase
      sectionTitle={t('menu.general')}
      contentType="general"
      breadcrumbItems={[
        { label: t('menu.contentSite'), isActive: false },
        { label: t('menu.general'), isActive: true }
      ]}
    />
  );
};

export default ContentGeneral; 