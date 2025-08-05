import React from 'react';
import { ContentListBase } from '../ContentListBase';

/**
 * ContentGeneral component displays the general pages content section
 * following Confluence Page 3 specification for "Общие страницы"
 */
const ContentGeneral: React.FC = () => {
  return (
    <ContentListBase
      sectionTitle="Общие страницы"
      contentType="general"
      breadcrumbItems={[
        { label: 'Контент сайта', isActive: false },
        { label: 'Общие страницы', isActive: true }
      ]}
    />
  );
};

export default ContentGeneral; 