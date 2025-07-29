/**
 * MenuEdit Component
 * Generic edit page for menu content items
 * 
 * @version 1.0.0
 * @since 2025-01-29
 */

import React from 'react';
import { AdminLayout } from '../../components';
import { SharedContentEditForm } from '../SharedContentEditForm';

const MenuEdit: React.FC = () => {
  return (
    <AdminLayout title="Редактирование контента меню" activeMenuItem="content-menu">
      <SharedContentEditForm contentType="menu" />
    </AdminLayout>
  );
};

export default MenuEdit;