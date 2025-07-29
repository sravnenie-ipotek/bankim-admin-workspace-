/**
 * MenuTextEdit Component
 * Edit page for text-type menu content items
 * Based on MortgageTextEdit pattern
 * 
 * @version 1.0.0
 * @since 2025-01-29
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedMenu } from '../../components';
import { SharedTextEdit, type TextEditData, type BreadcrumbItem } from '../../shared/components';

interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  action_number?: number;
  last_modified: string;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
}

const MenuTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get action number from location state
  const actionNumber = location.state?.actionNumber || null;

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching menu content item with ID:', actionId);
      const result = await apiService.getContentItemById(actionId!);
      console.log('📋 API response:', result);
      
      if (result.success && result.data) {
        console.log('✅ Content fetched successfully:', result.data);
        setContent(result.data);
      } else {
        console.log('❌ Content not found:', result);
        setError('Контент не найден');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: { ru: string; he: string; en?: string }) => {
    if (!content) return;

    try {
      setSaving(true);
      const result = await apiService.updateContentItem(content.id, {
        translations: updates
      });

      if (result.success) {
        // Navigate back to the return path or menu drill page
        const returnPath = location.state?.returnPath || '/content/menu';
        navigate(returnPath, {
          state: {
            fromPage: location.state?.drillPage || 1,
            searchTerm: location.state?.drillSearchTerm || ''
          }
        });
      } else {
        setError(result.error || 'Ошибка сохранения');
      }
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Ошибка сохранения контента');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || '/content/menu';
    navigate(returnPath, {
      state: {
        fromPage: location.state?.drillPage || 1,
        searchTerm: location.state?.drillSearchTerm || ''
      }
    });
  };

  // Transform content to SharedTextEdit format
  const textEditData: TextEditData | null = content ? {
    id: content.id,
    type: 'text',
    action_number: actionNumber || content.action_number,
    content_key: content.content_key,
    component_type: content.component_type || 'text',
    screen_location: content.screen_location || '',
    description: content.description || '',
    is_active: content.is_active !== false,
    contentKey: content.content_key,
    translations: {
      ru: content.translations.ru || '',
      he: content.translations.he || '',
      en: content.translations.en || ''
    },
    lastModified: content.last_modified
  } : null;

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Контент сайта', onClick: () => navigate('/content-management') },
    { label: 'Меню', onClick: () => navigate('/content/menu') },
    { label: content?.description || 'Редактирование текста', active: true }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1F2A37' }}>
      <SharedMenu activeItem="content-menu" />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <SharedTextEdit
          data={textEditData}
          loading={loading}
          saving={saving}
          error={error}
          onSave={handleSave}
          onCancel={handleCancel}
          breadcrumbs={breadcrumbs}
          actionNumber={actionNumber}
          entityType="menu"
        />
      </div>
    </div>
  );
};

export default MenuTextEdit;