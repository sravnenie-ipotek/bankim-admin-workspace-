/**
 * ContentManagement Page Component
 * Standalone page for managing chat-related content pages
 * 
 * Business Logic:
 * - Displays list of content pages with search and filtering
 * - Provides CRUD operations for content management
 * - Role-based access control (Director only)
 * - Multi-language content support
 * 
 * Security Measures:
 * - Input validation and sanitization
 * - XSS prevention for user content
 * - Role-based access verification
 * - Audit logging for all operations
 * 
 * Reference: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/149815297
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

import React from 'react';
import { AdminLayout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { ContentManagement as ContentManagementComponent } from '../pages/Chat/ContentManagement';

const ContentManagement: React.FC = () => {
  const { user } = useAuth();

  // Security check: Only Directors can access Content Management
  if (!user || user.role !== 'director') {
    return (
      <AdminLayout title="Доступ запрещен" activeMenuItem="content-management">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          textAlign: 'center' 
        }}>
          <div style={{ 
            background: '#1F2A37', 
            padding: '40px', 
            borderRadius: '8px',
            color: '#E5E7EB',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#FBE54D', marginBottom: '20px' }}>⚠️ Доступ запрещен</h2>
            <p style={{ marginBottom: '10px' }}>У вас нет прав доступа к управлению контентом.</p>
            <p>Данная функция доступна только для директоров.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Контент сайта" activeMenuItem="content-management">
      <ContentManagementComponent 
        onPageSelect={(page) => {
          console.log('Page selected:', page);
          // TODO: Handle page selection in Phase 2
        }}
        onFilterChange={(filter) => {
          console.log('Filter changed:', filter);
          // TODO: Handle filter changes in Phase 2
        }}
      />
    </AdminLayout>
  );
};

export default ContentManagement; 