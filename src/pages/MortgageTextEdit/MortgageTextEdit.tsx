/**
 * MortgageTextEdit Component
 * Edit page for text-type mortgage content items
 * Now using SharedTextEdit component for consistent UI
 * 
 * @version 3.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedHeader, SharedMenu } from '../../components';
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

const MortgageTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the specific content item by ID
      console.log(`📋 Fetching content item with ID: ${actionId}`);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        if (targetContent) {
          // Normalize content for SharedTextEdit
          const normalizedContent: ContentItem = {
            id: targetContent.id?.toString() || actionId || '',
            action_number: (targetContent as any).action_number,
            content_key: targetContent.content_key || '',
            component_type: targetContent.component_type || 'text',
            screen_location: targetContent.screen_location || '',
            description: targetContent.description || (targetContent as any).translations?.ru || '',
            is_active: targetContent.is_active !== false,
            translations: {
              ru: (targetContent as any).translations?.ru || '',
              he: (targetContent as any).translations?.he || '',
              en: (targetContent as any).translations?.en || ''
            },
            last_modified: targetContent.updated_at || new Date().toISOString()
          };

          setContent(normalizedContent);
        } else {
          setError('Content not found');
        }
      } else {
        setError('Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { ruText: string; heText: string; additionalTexts: Array<{ ru: string; he: string }> }) => {
    if (!content) return;

    try {
      setSaving(true);
      console.log(`💾 Saving changes for content item ${content.id}`);
      
      // Update Russian translation
      const ruResponse = await apiService.updateContentTranslation(
        content.id,
        'ru',
        data.ruText
      );

      // Update Hebrew translation
      const heResponse = await apiService.updateContentTranslation(
        content.id,
        'he',
        data.heText
      );

      if (ruResponse.success && heResponse.success) {
        console.log('✅ Successfully saved all translations');
        navigate('/content/mortgage', { 
          state: { 
            fromPage: location.state?.fromPage || 1,
            searchTerm: location.state?.searchTerm || ''
          } 
        });
      } else {
        console.error('❌ Failed to save some translations');
        setError('Failed to save changes');
      }
    } catch (err) {
      console.error('❌ Error saving content:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/content/mortgage', { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  // Convert ContentItem to TextEditData format
  const getTextEditData = (): TextEditData | null => {
    if (!content) return null;
    
    return {
      id: content.id,
      action_number: content.action_number,
      content_key: content.content_key,
      component_type: content.component_type,
      screen_location: content.screen_location,
      description: content.description,
      is_active: content.is_active,
      translations: content.translations,
      last_modified: content.last_modified
    };
  };

  // Define breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Страницы сайта',
      onClick: () => navigate('/content/mortgage')
    },
    {
      label: 'Главная страница Страница №1',
      onClick: () => navigate('/content/mortgage')
    },
    {
      label: `Действие №${content?.action_number}`,
      isActive: true
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111928' }}>
      <SharedMenu />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '264px' }}>
        <SharedHeader />
        {content ? (
          <SharedTextEdit
            content={getTextEditData()!}
            breadcrumbs={breadcrumbs}
            loading={loading}
            error={error}
            onSave={handleSave}
            onCancel={handleCancel}
            pageSubtitle="mortgage_calculation"
            saving={saving}
          />
        ) : loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Загрузка...</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Ошибка: {error || 'Данные не найдены'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageTextEdit;