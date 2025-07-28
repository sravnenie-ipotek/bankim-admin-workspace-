/**
 * CreditTextEdit Component
 * Edit page for text-type credit content items
 * Wrapper component that fetches data and renders SharedTextEdit
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedTextEdit, type TextEditData, type BreadcrumbItem } from '../../shared/components/SharedTextEdit';

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

const CreditTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const actionNumber = location.state?.actionNumber || null;

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📋 Fetching credit content item with ID: ${actionId}`);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        if (targetContent) {
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
      console.error('Error fetching credit content:', err);
      setError('Failed to load credit content data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { ruText: string; heText: string; additionalTexts: Array<{ ru: string; he: string }> }) => {
    if (!content) return;

    try {
      setSaving(true);
      
      const updateData = {
        translations: {
          ru: data.ruText,
          he: data.heText,
          en: content.translations.en || ''
        }
      };

      console.log(`💾 Saving credit content item ${content.id}:`, updateData);
      const response = await apiService.updateContentItem(content.id, updateData);
      
      if (response.success) {
        console.log('✅ Credit content updated successfully');
        handleCancel(); // Go back to previous page
      } else {
        setError('Failed to save credit content');
      }
    } catch (err) {
      console.error('Error saving credit content:', err);
      setError('Failed to save credit content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const returnPath = location.state?.returnPath;
    const fromPage = location.state?.fromPage || 1;
    const searchTerm = location.state?.searchTerm || '';
    
    if (returnPath) {
      navigate(returnPath, { 
        state: { 
          fromPage: fromPage,
          searchTerm: searchTerm 
        } 
      });
    } else {
      navigate('/content/credit', { 
        state: { 
          fromPage: fromPage,
          searchTerm: searchTerm 
        } 
      });
    }
  };

  // Create breadcrumbs for navigation
  const breadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Контент сайта', 
      onClick: () => navigate('/content/credit'),
      isActive: false 
    },
    { 
      label: 'Кредит', 
      onClick: () => navigate('/content/credit'),
      isActive: false 
    },
    { 
      label: `Действие №${actionNumber || content?.action_number || actionId}`, 
      isActive: true 
    }
  ];

  if (loading || !content) {
    return (
      <SharedTextEdit
        content={null as any}
        breadcrumbs={breadcrumbs}
        loading={loading}
        error={error}
        onSave={handleSave}
        onCancel={handleCancel}
        showAdditionalText={false}
        pageSubtitle="Редактирование текста кредита"
      />
    );
  }

  const textEditData: TextEditData = {
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

  return (
    <SharedTextEdit
      content={textEditData}
      breadcrumbs={breadcrumbs}
      loading={saving}
      error={error}
      onSave={handleSave}
      onCancel={handleCancel}
      showAdditionalText={false}
      pageSubtitle="Редактирование текста кредита"
    />
  );
};

export default CreditTextEdit; 