import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components';
import ContentMortgageEdit from '../ContentMortgageEdit';
import ContentMenuEdit from '../ContentMenuEdit';
// import ContentMortgageRefiEdit from '../ContentMortgageRefiEdit'; // Has specific route in App.tsx
import ContentCreditEdit from '../ContentCreditEdit';
// import ContentCreditRefiEdit from '../ContentCreditRefiEdit'; // Has TypeScript issues, needs fixing

// Configuration for each content type's edit component
interface ContentEditConfig {
  title: string;
  activeMenuItem: string;
  component: React.ComponentType;
}

const contentEditConfig: Record<string, ContentEditConfig> = {
  'menu': {
    title: 'Редактирование контента меню',
    activeMenuItem: 'content-menu',
    component: ContentMenuEdit
  },
  'mortgage': {
    title: 'Редактирование контента ипотеки',
    activeMenuItem: 'content-mortgage',
    component: ContentMortgageEdit
  },
  // 'mortgage-refi': {
  //   title: 'Редактирование контента рефинансирования ипотеки',
  //   activeMenuItem: 'content-mortgage-refi',
  //   component: ContentMortgageRefiEdit
  // },
  'credit': {
    title: 'Редактирование контента кредита',
    activeMenuItem: 'content-credit',
    component: ContentCreditEdit
  },
  // 'credit-refi': {
  //   title: 'Редактирование контента рефинансирования кредита',
  //   activeMenuItem: 'content-credit-refi',
  //   component: ContentCreditRefiEdit
  // }
};

/**
 * SharedContentEdit - A shared component for all content edit pages
 * Dynamically renders the appropriate edit component based on the contentType URL parameter
 */
const SharedContentEdit: React.FC = () => {
  const { contentType } = useParams<{ contentType: string }>();

  // Validate content type
  if (!contentType || !contentEditConfig[contentType]) {
    return <Navigate to="/content-management" replace />;
  }

  const config = contentEditConfig[contentType];
  const EditComponent = config.component;

  return (
    <AdminLayout title={config.title} activeMenuItem={config.activeMenuItem}>
      <EditComponent />
    </AdminLayout>
  );
};

export default SharedContentEdit;