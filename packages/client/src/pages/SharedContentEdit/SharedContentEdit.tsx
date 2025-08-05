import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components';
import { SharedContentEditForm } from '../SharedContentEditForm';

// Configuration for each content type
interface ContentEditConfig {
  title: string;
  activeMenuItem: string;
}

const contentEditConfig: Record<string, ContentEditConfig> = {
  'menu': {
    title: 'Редактирование контента меню',
    activeMenuItem: 'content-menu'
  },
  'mortgage': {
    title: 'Редактирование контента ипотеки',
    activeMenuItem: 'content-mortgage'
  },
  'mortgage-refi': {
    title: 'Редактирование контента рефинансирования ипотеки',
    activeMenuItem: 'content-mortgage-refi'
  },
  'credit': {
    title: 'Редактирование контента кредита',
    activeMenuItem: 'content-credit'
  },
  'credit-refi': {
    title: 'Редактирование контента рефинансирования кредита',
    activeMenuItem: 'content-credit-refi'
  },
  'general': {
    title: 'Редактирование общего контента',
    activeMenuItem: 'content-general'
  }
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

  return (
    <AdminLayout title={config.title} activeMenuItem={config.activeMenuItem}>
      <SharedContentEditForm contentType={contentType} />
    </AdminLayout>
  );
};

export default SharedContentEdit;