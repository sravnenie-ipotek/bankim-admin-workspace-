import React from 'react';
import { ContentListBase } from '../ContentListBase';

/**
 * ContentCreditRefi component displays the credit refinancing content section
 * following Confluence Page 3 specification for "Рефинансирование кредита"
 */
const ContentCreditRefi: React.FC = () => {
  return (
    <ContentListBase
      sectionTitle="Рефинансирование кредита"
      contentType="credit-refi"
      breadcrumbItems={[
        { label: 'Контент сайта', isActive: false },
        { label: 'Рефинансирование кредита', isActive: true }
      ]}
    />
  );
};

export default ContentCreditRefi; 