/**
 * ContentMenuEdit Component
 * Edit page for menu content items
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ContentMenuEdit.css';

interface MenuTranslation {
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

const ContentMenuEdit: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentItem, setContentItem] = useState<MenuTranslation | null>(null);
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentItem();
  }, [itemId]);

  const fetchContentItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the menu translations
      const response = await apiService.getMenuTranslations();
      
      if (response.success && response.data?.menu_items) {
        const item = response.data.menu_items.find((item: MenuTranslation) => item.id === itemId);
        console.log('Found menu item:', item);
        
        if (item) {
          setContentItem(item);
          setTitleRu(item.translations?.ru || '');
          setTitleHe(item.translations?.he || '');
          setTitleEn(item.translations?.en || '');
        } else {
          setError('Menu item not found');
        }
      } else {
        setError('Failed to load menu data');
      }
    } catch (err) {
      console.error('Error fetching menu item:', err);
      setError('Failed to load menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contentItem) return;

    try {
      setSaving(true);
      setError(null);

      // Save all three translations
      const promises = [];
      
      if (titleRu !== contentItem.translations.ru) {
        promises.push(apiService.updateMenuTranslation(itemId!, 'ru', titleRu));
      }
      
      if (titleHe !== contentItem.translations.he) {
        promises.push(apiService.updateMenuTranslation(itemId!, 'he', titleHe));
      }
      
      if (titleEn !== contentItem.translations.en) {
        promises.push(apiService.updateMenuTranslation(itemId!, 'en', titleEn));
      }

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        const allSuccessful = results.every(result => result.success);
        
        if (allSuccessful) {
          navigate('/content/menu');
        } else {
          setError('Some translations failed to save');
        }
      } else {
        // No changes to save
        navigate('/content/menu');
      }
    } catch (err) {
      console.error('Error saving translations:', err);
      setError('Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/content/menu');
  };

  if (loading) {
    return (
      <div className="content-menu-edit-loading">
        <div className="loading-spinner"></div>
        <p>Loading menu item...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-menu-edit-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/content/menu')} className="btn-secondary">
          Back to Menu
        </button>
      </div>
    );
  }

  if (!contentItem) {
    return null;
  }

  return (
    <div className="content-menu-edit">
      <div className="content-menu-edit-header">
        <h1>Edit Menu Item</h1>
        <div className="breadcrumb">
          <span onClick={() => navigate('/content/menu')} style={{ cursor: 'pointer', color: '#6366F1' }}>
            Menu
          </span>
          <span> / </span>
          <span>{contentItem.content_key}</span>
        </div>
      </div>

      <div className="content-menu-edit-form">
        <div className="form-section">
          <h2>Item Details</h2>
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
          <h2>Translations</h2>
          
          <div className="form-group">
            <label htmlFor="titleRu">Russian (RU)</label>
            <input
              id="titleRu"
              type="text"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              className="form-input"
              placeholder="Enter Russian translation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="titleHe">Hebrew (HE)</label>
            <input
              id="titleHe"
              type="text"
              value={titleHe}
              onChange={(e) => setTitleHe(e.target.value)}
              className="form-input"
              dir="rtl"
              placeholder="Enter Hebrew translation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="titleEn">English (EN)</label>
            <input
              id="titleEn"
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="form-input"
              placeholder="Enter English translation"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentMenuEdit;