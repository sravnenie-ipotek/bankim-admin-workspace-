/**
 * MortgageRefiTextEdit Component
 * Edit page for text-type mortgage refinancing content items
 * Refactored to use SharedTextEdit component
 * 
 * @version 2.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import SharedTextEdit from '../../shared/components/SharedTextEdit/SharedTextEdit';
import { apiService } from '../../services/api';

interface TextEditData {
  id: string;
  action_number?: number;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
}

interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
  action_number?: number;
}

const MortgageRefiTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get action number from location state (passed from previous screen)
  const actionNumber = location.state?.actionNumber || null;

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📖 Fetching mortgage-refi text content for action ID: ${actionId}`);
      
      // Try to get specific content item first
      const response = await apiService.request(`/api/content/item/${actionId}`, { method: 'GET' });
      
      if (response.success && response.data) {
        const targetContent = response.data as any;
        console.log('✅ Found target content item:', targetContent);
        
        // Normalize the content structure for SharedTextEdit
        const normalizedContent: ContentItem = {
          id: targetContent.id?.toString() || actionId || '',
          action_number: actionNumber || (targetContent as any).action_number,
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
        console.log('❌ Content item not found, error:', response.error);
        setError('Контент не найден');
      }
    } catch (err) {
      console.error('❌ Error fetching mortgage-refi content data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (data: { ruText: string; heText: string; additionalTexts: { ru: string; he: string; }[]; }) => {
    if (!content) return;
    
    try {
      setSaving(true);
      console.log('💾 Saving mortgage-refi text content...');
      
      // Update Russian translation
      await apiService.updateContentTranslation(content.id, 'ru', data.ruText);
      
      // Update Hebrew translation
      await apiService.updateContentTranslation(content.id, 'he', data.heText);
      
      // Update English translation if needed
      if (content.translations.en !== content.translations.en) {
        await apiService.updateContentTranslation(content.id, 'en', content.translations.en || '');
      }
      
      console.log('✅ Mortgage-refi text content saved successfully');
      
      // Navigate back to the content list
      const returnPath = location.state?.returnPath || '/content/mortgage-refi';
      navigate(returnPath, {
        state: {
          fromPage: location.state?.fromPage || 1,
          searchTerm: location.state?.searchTerm || ''
        }
      });
    } catch (err) {
      console.error('❌ Error saving mortgage-refi text content:', err);
      setError('Ошибка сохранения данных');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || '/content/mortgage-refi';
    navigate(returnPath, {
      state: {
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || '',
        drillPage: location.state?.drillPage || 1,
        drillSearchTerm: location.state?.drillSearchTerm || '',
        baseActionNumber: location.state?.baseActionNumber || 0
      }
    });
  };

  const breadcrumbs = [
    {
      label: 'Контент сайта',
      onClick: () => navigate('/content'),
      isActive: false
    },
    {
      label: 'Рефинансирование ипотеки',
      onClick: () => navigate('/content/mortgage-refi'),
      isActive: false
    },
    {
      label: 'Список действий',
      onClick: handleCancel,
      isActive: false
    },
    {
      label: 'Редактирование',
      onClick: () => {},
      isActive: true
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111928' }}>
      <AdminLayout />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '264px' }}>
        {content ? (
          <SharedTextEdit
            content={getTextEditData()!}
            breadcrumbs={breadcrumbs}
            loading={loading}
            error={error}
            onSave={handleSave}
            onCancel={handleCancel}
            pageSubtitle="mortgage_refi"
            saving={saving}
          />
        ) : loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: 1, 
            color: '#F9FAFB' 
          }}>
            <div style={{ fontSize: '18px', marginBottom: '16px' }}>Загрузка данных...</div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: 1, 
            color: '#F9FAFB' 
          }}>
            <div style={{ fontSize: '18px', marginBottom: '16px', color: '#EF4444' }}>
              {error || 'Данные не найдены'}
            </div>
            <button 
              onClick={handleCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: '#F9FAFB',
                cursor: 'pointer'
              }}
            >
              Вернуться назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageRefiTextEdit; 