import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import '../ContentMenuEdit/ContentMenuEdit.css';

interface MortgageRefiTranslation {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
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

const ContentMortgageRefiEdit: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentItem, setContentItem] = useState<MortgageRefiTranslation | null>(null);
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
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

      // Fetch mortgage-refi content list
      const response = await apiService.getContentByContentType('mortgage-refi');

      if (response.success && response.data) {
        const item = response.data.find((i: any) => i.id === itemId);
        if (item) {
          setContentItem(item as any);
          setTitleRu(item.translations?.ru || '');
          setTitleHe(item.translations?.he || '');
          setTitleEn(item.translations?.en || '');
        } else {
          setError('Элемент контента не найден');
        }
      } else {
        setError(response.error || 'Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('Error fetching mortgage-refi item:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contentItem) return;
    try {
      setSaving(true);
      setError(null);

      const promises = [];
      if (titleRu !== contentItem.translations.ru) {
        promises.push(apiService.updateContentTranslation(itemId!, 'ru', titleRu));
      }
      if (titleHe !== contentItem.translations.he) {
        promises.push(apiService.updateContentTranslation(itemId!, 'he', titleHe));
      }
      if (titleEn !== contentItem.translations.en) {
        promises.push(apiService.updateContentTranslation(itemId!, 'en', titleEn));
      }

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        const allOk = results.every(r => r.success);
        if (!allOk) {
          setError('Не все переводы были сохранены');
          return;
        }
      }

      navigate('/content/mortgage-refi', {
        state: {
          fromPage: location.state?.fromPage || 1,
          searchTerm: location.state?.searchTerm || ''
        }
      });
    } catch (err) {
      console.error('Error saving translations:', err);
      setError('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/content/mortgage-refi', {
      state: {
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      }
    });
  };

  // UI states
  if (loading) {
    return (
      <AdminLayout title="Редактирование контента (Рефинансирование ипотеки)" activeMenuItem="content-mortgage-refi">
        <div className="content-menu-edit-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка контента...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Редактирование контента (Рефинансирование ипотеки)" activeMenuItem="content-mortgage-refi">
        <div className="content-menu-edit-error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="btn-secondary">Назад</button>
        </div>
      </AdminLayout>
    );
  }

  if (!contentItem) return null;

  return (
    <AdminLayout title="Редактирование контента (Рефинансирование ипотеки)" activeMenuItem="content-mortgage-refi">
      <div className="content-menu-edit">
        <div className="content-menu-edit-header">
          <h1>Редактирование контента (Рефинансирование ипотеки)</h1>
          <div className="breadcrumb">
            <span onClick={() => handleCancel()} style={{ cursor: 'pointer', color: '#6366F1' }}>
              Рефинансирование ипотеки
            </span>
            <span> / </span>
            <span>{contentItem.content_key}</span>
          </div>
        </div>

        <div className="content-menu-edit-form">
          <div className="form-section">
            <h2>Детали элемента</h2>
            <div className="form-info">
              <div className="info-row">
                <span className="info-label">Content Key:</span>
                <span className="info-value">{contentItem.content_key}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">{contentItem.component_type}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Category:</span>
                <span className="info-value">{contentItem.category}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Location:</span>
                <span className="info-value">{contentItem.screen_location}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Переводы</h2>
            <div className="form-group">
              <label htmlFor="titleRu">Russian (RU)</label>
              <input id="titleRu" type="text" value={titleRu} onChange={e => setTitleRu(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="titleHe">Hebrew (HE)</label>
              <input id="titleHe" type="text" value={titleHe} onChange={e => setTitleHe(e.target.value)} className="form-input" dir="rtl" />
            </div>
            <div className="form-group">
              <label htmlFor="titleEn">English (EN)</label>
              <input id="titleEn" type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="form-input" />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button className="btn-secondary" disabled={saving} onClick={handleCancel}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentMortgageRefiEdit; 