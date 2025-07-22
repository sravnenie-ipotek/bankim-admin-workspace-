import React from 'react';
import { ContentListBase } from '../ContentListBase';

/**
 * ContentCredit component displays the credit calculation content section
 * following Confluence Page 3 specification for "Расчет кредита"
 */
const ContentCredit: React.FC = () => {
  return (
    <ContentListBase
      sectionTitle="Расчет кредита"
      contentType="credit"
      breadcrumbItems={[
        { label: 'Контент сайта', isActive: false },
        { label: 'Расчет кредита', isActive: true }
      ]}
    />
  );
};

export default ContentCredit; 