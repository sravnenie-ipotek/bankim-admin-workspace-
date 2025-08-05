/**
 * MenuDropdownEdit Component
 * Edit page for dropdown-type menu content items
 * Based on SharedDropdownEdit pattern
 * 
 * @version 1.0.0
 * @since 2025-01-29
 */

import React from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '../../components';
import SharedDropdownEdit from '../SharedDropdownEdit/SharedDropdownEdit';

const MenuDropdownEdit: React.FC = () => {
  // const { actionId } = useParams<{ actionId: string }>();
  // const navigate = useNavigate();
  // const location = useLocation();

  // const handleBack = () => {
  //   const returnPath = location.state?.returnPath || '/content/menu';
  //   navigate(returnPath, {
  //     state: {
  //       fromPage: location.state?.drillPage || 1,
  //       searchTerm: location.state?.drillSearchTerm || ''
  //     }
  //   });
  // };

  return (
    <AdminLayout title="Редактирование дропдауна меню" activeMenuItem="content-menu">
      <SharedDropdownEdit />
    </AdminLayout>
  );
};

export default MenuDropdownEdit;