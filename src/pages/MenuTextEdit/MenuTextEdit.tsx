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

// Interface matching what the backend actually returns
interface ContentItem {
  id: number;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  action_number?: string;
  updated_at: string;
  translations: {
    ru: string;
    he: string;
    en: string;
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
    // Clear cache before fetching to ensure we get fresh data
    apiService.clearContentCache();
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
        console.log('Data type:', typeof result.data);
        console.log('Data keys:', Object.keys(result.data));
        // Cast the data to our local ContentItem type
        setContent(result.data as any as ContentItem);
      } else {
        console.log('❌ Content not found:', result);
        console.log('Full API response:', JSON.stringify(result, null, 2));
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
      const result = await apiService.updateContentItem(String(content.id), {
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
    id: String(content.id),
    action_number: typeof content.action_number === 'string' ? parseInt(content.action_number) : content.action_number,
    content_key: content.content_key,
    component_type: content.component_type || 'text',
    screen_location: content.screen_location || '',
    description: content.description || '',
    is_active: content.is_active !== false,
    translations: {
      ru: content.translations.ru || '',
      he: content.translations.he || '',
      en: content.translations.en || ''
    },
    last_modified: content.updated_at
  } : null;

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Контент сайта', onClick: () => navigate('/content-management') },
    { label: 'Меню', onClick: () => navigate('/content/menu') },
    { label: content?.description || 'Редактирование текста', isActive: true }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1F2A37' }}>
      <SharedMenu activeItem="content-menu" />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        {textEditData ? (
          <SharedTextEdit
            content={textEditData}
            loading={loading}
            saving={saving}
            error={error}
            onSave={(data) => {
              handleSave({
                ru: data.ruText,
                he: data.heText,
                en: textEditData.translations.en
              });
            }}
            onCancel={handleCancel}
            breadcrumbs={breadcrumbs}
          />
        ) : (
          <div className="shared-text-edit-error">
            <p>Ошибка: Контент не найден</p>
            <button onClick={handleCancel}>Вернуться назад</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTextEdit;