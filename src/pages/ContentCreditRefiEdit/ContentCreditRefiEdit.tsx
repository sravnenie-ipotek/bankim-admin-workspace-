import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import '../ContentMenuEdit/ContentMenuEdit.css';

interface CreditRefiTranslation {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string | null;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
}

const ContentCreditRefiEdit: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentItem, setContentItem] = useState<CreditRefiTranslation | null>(null);
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const fetchContentItem = async () => {
    if (!itemId) return;
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching credit-refi content for item ID:', itemId);
      console.log('🔍 ItemId type:', typeof itemId, 'Value:', itemId);

      // Get credit-refi content
      const response = await apiService.getContentByContentType('credit-refi');
      console.log('💾 API Response:', response);

      if (response.success && response.data) {
        const item = response.data.find((item: any) => item.id === itemId);
        console.log('🎯 Found content item:', item);

        if (item) {
          // Transform ContentListItem to CreditRefiTranslation format
          const transformedItem: CreditRefiTranslation = {
            id: item.id,
            content_key: item.content_key || '',
            component_type: item.component_type || 'text',
            category: item.category || '',
            screen_location: item.screen_location || '',
            description: item.description || null,
            is_active: item.is_active ?? true,
            translations: {
              ru: item.translations?.ru || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            last_modified: item.lastModified || new Date().toISOString()
          };
          setContentItem(transformedItem);
          setTitleRu(item.translations?.ru || '');
          setTitleHe(item.translations?.he || '');
          setTitleEn(item.translations?.en || '');
        } else {
          console.error('❌ Content item not found with ID:', itemId);
          setError(`Content item not found with ID: ${itemId}`);
        }
      } else {
        console.error('❌ Failed to fetch credit-refi content:', response.error);
        setError(response.error || 'Failed to fetch credit-refi content');
      }
    } catch (err) {
      console.error('❌ Error fetching content item:', err);
      setError('Error fetching content item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contentItem) return;

    try {
      setSaving(true);
      console.log('💾 Saving credit-refi content...');

      // Prepare translations data
      const translationsData = {
        ru: titleRu,
        he: titleHe,
        en: titleEn
      };

      console.log('📤 Sending translation update:', {
        id: contentItem.id,
        translations: translationsData
      });

      // Update each language translation separately
      const responses = [];
      
      // Update Russian translation
      const ruResponse = await apiService.updateContentTranslation(contentItem.id, 'ru', translationsData.ru);
      responses.push(ruResponse);
      
      // Update Hebrew translation  
      const heResponse = await apiService.updateContentTranslation(contentItem.id, 'he', translationsData.he);
      responses.push(heResponse);
      
      // Update English translation
      const enResponse = await apiService.updateContentTranslation(contentItem.id, 'en', translationsData.en);
      responses.push(enResponse);
      
      // Check if all updates were successful
      const allSuccessful = responses.every(response => response.success);
      const response = { 
        success: allSuccessful, 
        error: allSuccessful ? undefined : 'Some translations failed to update' 
      };
      console.log('✅ Save response:', response);

      if (response.success) {
        console.log('✅ Credit refinancing content updated successfully!');
        
        // Navigate back to credit-refi list
        navigate('/content/credit-refi', { 
          state: { 
            fromPage: location.state?.fromPage || 1,
            searchTerm: location.state?.searchTerm || ''
          } 
        });
      } else {
        console.error('❌ Failed to update credit-refi content:', response.error);
        setError(response.error || 'Failed to update content');
      }
    } catch (err) {
      console.error('❌ Error saving content:', err);
      setError('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/content/credit-refi', { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Редактирование контента рефинансирования кредита">
        <div className="menu-edit-container">
          <div className="loading-state">Загрузка...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Редактирование контента рефинансирования кредита">
        <div className="menu-edit-container">
          <div className="error-state">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Редактирование контента рефинансирования кредита">
      <div className="menu-edit-container">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item">Контент сайта</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Рефинансирование кредита</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Редактирование</span>
        </div>

        {/* Header */}
        <div className="page-header-edit">
          <div className="header-content">
            <h1 className="page-title-edit">
              {selectedLanguage === 'ru' ? (contentItem?.translations?.ru || contentItem?.content_key) :
               selectedLanguage === 'he' ? (contentItem?.translations?.he || contentItem?.content_key) :
               (contentItem?.translations?.en || contentItem?.content_key)}
            </h1>
            <span className="page-subtitle">Credit_refinance_page</span>
          </div>
          <div className="language-selector-edit" onClick={() => {
            // Cycle through languages
            if (selectedLanguage === 'ru') setSelectedLanguage('he');
            else if (selectedLanguage === 'he') setSelectedLanguage('en');
            else setSelectedLanguage('ru');
          }}>
            <span className="language-text">
              {selectedLanguage === 'ru' ? 'Русский' : 
               selectedLanguage === 'he' ? 'עברית' : 
               'English'}
            </span>
            <img src="/src/assets/images/static/icons/chevron-down.svg" alt="Chevron" className="language-chevron" />
          </div>
        </div>

        {/* Last Edit Info */}
        <div className="last-edit-info">
          <span className="last-edit-label">Последнее редактирование</span>
          <span className="last-edit-value">
            {contentItem?.last_modified ? new Date(contentItem.last_modified).toLocaleString('ru-RU') : 'Не известно'}
          </span>
        </div>

        {/* Content Editing Section */}
        <div className="content-section">
          <h2 className="section-title">Заголовки действия</h2>
          
          {/* Russian */}
          <div className="language-group">
            <label className="language-label">RU</label>
            <div className="input-container">
              <input
                type="text"
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
                className="content-input"
                placeholder="Введите текст на русском"
              />
            </div>
          </div>

          {/* Hebrew */}
          <div className="language-group">
            <label className="language-label">HEB</label>
            <div className="input-container">
              <input
                type="text"
                value={titleHe}
                onChange={(e) => setTitleHe(e.target.value)}
                className="content-input hebrew-input"
                placeholder="הזן טקסט בעברית"
                dir="rtl"
              />
            </div>
          </div>

          {/* English */}
          <div className="language-group">
            <label className="language-label">EN</label>
            <div className="input-container">
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="content-input"
                placeholder="Enter text in English"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleBack}
            className="btn-secondary"
          >
            Назад
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Сохранение...' : 'Сохранить и опубликовать'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentCreditRefiEdit; 