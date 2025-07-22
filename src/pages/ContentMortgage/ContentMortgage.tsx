import React from 'react';
import { ContentListBase } from '../ContentListBase';

/**
 * ContentMortgage component displays the mortgage content section
 * following Confluence Page 3 specification for "Рассчитать ипотеку"
 * 
 * This component reuses ContentListBase to avoid code duplication
 * and ensures consistent UI across all content sections
 */
const ContentMortgage: React.FC = () => {
  return (
    <ContentListBase
      sectionTitle="Рассчитать ипотеку"
      contentType="mortgage"
      breadcrumbItems={[
        { label: 'Контент сайта', isActive: false },
        { label: 'Рассчитать ипотеку', isActive: true }
      ]}
    />
  );
};

export default ContentMortgage; 