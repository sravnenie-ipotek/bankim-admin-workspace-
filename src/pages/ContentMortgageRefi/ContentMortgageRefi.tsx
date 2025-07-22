import React from 'react';
import { ContentListBase } from '../ContentListBase';

/**
 * ContentMortgageRefi component displays the mortgage refinancing content section
 * following Confluence Page 3 specification for "Рефинансирование ипотеки"
 */
const ContentMortgageRefi: React.FC = () => {
  return (
    <ContentListBase
      sectionTitle="Рефинансирование ипотеки"
      contentType="mortgage-refi"
      breadcrumbItems={[
        { label: 'Контент сайта', isActive: false },
        { label: 'Рефинансирование ипотеки', isActive: true }
      ]}
    />
  );
};

export default ContentMortgageRefi; 