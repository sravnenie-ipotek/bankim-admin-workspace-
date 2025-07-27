/**
 * MortgageDropdownEdit Component
 * Edit page for dropdown-type mortgage content items
 * Based on dropDownEdit.md design specification
 * 
 * @version 1.0.0
 * @since 2025-01-26
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { AdminLayout } from '../../components';
import './MortgageDropdownEdit.css';

interface DropdownContent {
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
  action_number?: number;
}

interface DropdownOption {
  ru: string;
  he: string;
}

const MortgageDropdownEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<DropdownContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form states
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      console.log(`📋 Fetching dropdown content for action ID: ${actionId}`);
      
      // Fetch the specific content item - first try dedicated endpoint
      let response = await apiService.getContentItemById(actionId);
      
      // If that fails, try fetching from mortgage content
      if (!response.success || !response.data) {
        console.log(`📋 Trying to fetch from mortgage content...`);
        const mortgageResponse = await apiService.getMortgageContent();
        
        if (mortgageResponse.success && mortgageResponse.data) {
          // Find the item in the mortgage content
          const mortgageContent = mortgageResponse.data.mortgage_content || [];
          const item = mortgageContent.find((c: any) => c.id === actionId || c.id === parseInt(actionId));
          
          if (item) {
            response = { success: true, data: item };
          }
        }
      }
      
      if (response.success && response.data) {
        const item = response.data;
        setContent({
          id: item.id,
          content_key: item.content_key || '',
          component_type: item.component_type || 'dropdown',
          category: item.category || '',
          screen_location: item.screen_location || '',
          description: item.description || '',
          is_active: item.is_active !== false,
          translations: {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          },
          last_modified: item.updated_at || new Date().toISOString(),
          action_number: item.action_number
        });
        
        setTitleRu(item.translations?.ru || '');
        setTitleHe(item.translations?.he || '');
        
        // Initialize dropdown options based on the content
        initializeDropdownOptions(item);
      } else {
        setError('Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('❌ Error fetching content data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const initializeDropdownOptions = async (item: any) => {
    try {
      // Use the generic API function to fetch dropdown options
      console.log(`📋 Fetching dropdown options for content key: ${item.content_key}`);
      
      const response = await apiService.getMortgageDropdownOptions(item.content_key);
      
      if (response.success && response.data) {
        const options = response.data.map((optionItem: any) => ({
          ru: optionItem.translations?.ru || '',
          he: optionItem.translations?.he || ''
        }));
        
        console.log(`✅ Found ${options.length} dropdown options via generic API`);
        setDropdownOptions(options.length > 0 ? options : [
          { ru: '', he: '' } // Start with at least one empty option
        ]);
      } else {
        console.log('⚠️ No dropdown options found, initializing with empty option');
        setDropdownOptions([{ ru: '', he: '' }]);
      }
    } catch (err) {
      console.error('❌ Error fetching dropdown options:', err);
      // Initialize with empty options on error
      setDropdownOptions([{ ru: '', he: '' }]);
    }
  };

  const handleBack = () => {
    const returnPath = location.state?.returnPath || '/content/mortgage';
    navigate(returnPath, {
      state: {
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      }
    });
  };

  const handleSave = async () => {
    try {
      // First, update the main dropdown item's title
      const updateData = {
        translations: {
          ru: titleRu,
          he: titleHe,
          en: content?.translations.en || ''
        }
      };
      
      console.log(`📝 Updating dropdown title for ${actionId}`);
      const response = await apiService.updateMortgageContent(actionId, updateData);
      
      if (response.success && content) {
        // Now update the dropdown options
        // We need to update each option as a separate content item
        const baseKey = content.content_key;
        
        // Fetch existing options to update/delete
        const existingResponse = await apiService.getMortgageContent();
        if (existingResponse.success && existingResponse.data) {
          const contentItems = existingResponse.data.mortgage_content || [];
          const optionPattern = new RegExp(`^${baseKey}\\.option\\.\\d+`);
          const existingOptions = contentItems.filter((item: any) => 
            item.content_key && optionPattern.test(item.content_key)
          );
          
          // Update or create options
          for (let i = 0; i < dropdownOptions.length; i++) {
            const option = dropdownOptions[i];
            const optionKey = `${baseKey}.option.${i + 1}`;
            const existingOption = existingOptions.find((opt: any) => opt.content_key === optionKey);
            
            const optionData = {
              translations: {
                ru: option.ru,
                he: option.he,
                en: '' // English translation can be added later
              }
            };
            
            if (existingOption) {
              // Update existing option
              console.log(`📝 Updating option ${i + 1}`);
              await apiService.updateMortgageContent(existingOption.id, optionData);
            } else {
              // Create new option - this would need a create API endpoint
              console.log(`➕ Would create new option ${i + 1} (API endpoint needed)`);
            }
          }
          
          // Delete removed options
          for (let j = dropdownOptions.length; j < existingOptions.length; j++) {
            const optionToDelete = existingOptions[j];
            console.log(`🗑️ Would delete option ${optionToDelete.content_key} (API endpoint needed)`);
          }
        }
        
        setHasChanges(false);
        // Navigate back after successful save
        handleBack();
      } else {
        setError('Ошибка при сохранении');
      }
    } catch (err) {
      console.error('❌ Error saving content:', err);
      setError('Ошибка при сохранении данных');
    }
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he', value: string) => {
    const newOptions = [...dropdownOptions];
    newOptions[index][field] = value;
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const handleAddOption = () => {
    setDropdownOptions([...dropdownOptions, { ru: '', he: '' }]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = dropdownOptions.filter((_, i) => i !== index);
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  if (loading) {
    return (
      <div className="dropdown-edit-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="dropdown-edit-error">
        <p>Ошибка: {error || 'Данные не найдены'}</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="dropdown-edit-page">
        {/* Main Content Area */}
        <div className="dropdown-edit-main">
          {/* Breadcrumb */}
          <div style={{ borderRadius: '6px', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', display: 'inline-flex' }}>
            <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word', cursor: 'pointer' }} onClick={() => navigate('/content/mortgage')}>Контент сайта</div>
            </div>
            <div style={{ width: '20px', height: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '6.67px', height: '11.67px', left: '6.67px', top: '4.17px', position: 'absolute', background: 'var(--gray-400, #9CA3AF)' }}></div>
            </div>
            <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '21px', wordWrap: 'break-word', cursor: 'pointer' }} onClick={() => navigate('/content/mortgage')}>Главная страница Страница №1</div>
            </div>
            <div style={{ width: '20px', height: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '6.67px', height: '11.67px', left: '6.67px', top: '4.17px', position: 'absolute', background: 'var(--gray-400, #9CA3AF)' }}></div>
            </div>
            <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '21px', wordWrap: 'break-word' }}>Действие №{content.action_number || 1}</div>
            </div>
          </div>

          {/* Page Title */}
          <div style={{ width: '925px', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex', marginTop: '32px' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '12px', display: 'inline-flex' }}>
              <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '12px', display: 'inline-flex' }}>
                <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--gray-50, #F9FAFB)', fontSize: '30px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '45px', wordWrap: 'break-word' }}>Номер действия №{content.action_number || 1} | {content.description || 'Банк для кредита'}</div>
                <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '8px', display: 'flex' }}>
                  <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', wordWrap: 'break-word' }}>{content.screen_location || 'Home_page'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Modified Card */}
          <div style={{ width: '295px', padding: '24px', background: 'var(--gray-800, #1F2A37)', overflow: 'hidden', borderRadius: '8px', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex', marginTop: '40px' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'inline-flex' }}>
              <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', wordWrap: 'break-word' }}>Последнее редактирование</div>
              <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '18px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '27px', wordWrap: 'break-word' }}>{formatLastModified(content.last_modified)}</div>
            </div>
          </div>

          {/* Action Headers Section */}
          <div style={{ marginTop: '40px' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--gray-50, #F9FAFB)', fontSize: '20px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '30px', wordWrap: 'break-word', marginBottom: '24px' }}>Заголовки действий</div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ width: '289px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                <div style={{ alignSelf: 'stretch', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>RU</div>
                <div style={{ alignSelf: 'stretch', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--gray-700, #374151)', borderRadius: '8px', outline: '1px var(--gray-600, #4B5563) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                    <input
                      style={{ flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}
                      value={titleRu}
                      onChange={(e) => {
                        setTitleRu(e.target.value);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ width: '289px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                <div style={{ alignSelf: 'stretch', textAlign: 'right', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>HEB</div>
                <div style={{ alignSelf: 'stretch', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--gray-700, #374151)', borderRadius: '8px', outline: '1px var(--gray-600, #4B5563) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                  <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                    <input
                      style={{ flex: '1 1 0', textAlign: 'right', background: 'transparent', border: 'none', outline: 'none', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}
                      value={titleHe}
                      onChange={(e) => {
                        setTitleHe(e.target.value);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Options Section */}
          <div style={{ marginTop: '48px' }}>
            <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--gray-50, #F9FAFB)', fontSize: '20px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '30px', wordWrap: 'break-word', marginBottom: '24px' }}>Опции дропдауна</div>
          
            <div style={{ width: '925px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '24px', display: 'inline-flex' }}>
              {dropdownOptions.map((option, index) => (
                <div key={index} style={{ alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: '48px', display: 'inline-flex' }}>
                  <div style={{ width: '55px', height: '24px', position: 'relative' }}>
                    <div style={{ left: '46px', top: '0px', position: 'absolute', color: 'white', fontSize: '16px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '24px', wordWrap: 'break-word' }}>{index + 1}</div>
                    <div style={{ width: '24px', height: '24px', left: '0px', top: '0px', position: 'absolute', overflow: 'hidden' }}>
                      <div style={{ width: '16px', height: '14px', left: '4px', top: '5px', position: 'absolute', background: 'var(--gray-400, #9CA3AF)' }}></div>
                    </div>
                  </div>
                  <div style={{ justifyContent: 'center', alignItems: 'center', gap: '20px', display: 'flex' }}>
                    <div style={{ width: '295px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                      <div style={{ alignSelf: 'stretch', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>{index === 0 ? 'RU' : ''}</div>
                      <div style={{ alignSelf: 'stretch', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--gray-700, #374151)', borderRadius: '8px', outline: '1px var(--gray-600, #4B5563) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                        <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                          <input
                            style={{ flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}
                            value={option.ru}
                            onChange={(e) => handleOptionChange(index, 'ru', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '295px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                      <div style={{ alignSelf: 'stretch', textAlign: 'right', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>{index === 0 ? 'HEB' : ''}</div>
                      <div style={{ alignSelf: 'stretch', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--gray-700, #374151)', borderRadius: '8px', outline: '1px var(--gray-600, #4B5563) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                        <div style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                          <input
                            style={{ flex: '1 1 0', textAlign: 'right', background: 'transparent', border: 'none', outline: 'none', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}
                            value={option.he}
                            onChange={(e) => handleOptionChange(index, 'he', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ justifyContent: 'center', alignItems: 'center', gap: '16px', display: 'flex' }}>
                    <div style={{ padding: '4px', background: 'var(--gray-700, #374151)', borderRadius: '9999px', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer' }}>
                      <div style={{ width: '24px', height: '24px', position: 'relative' }}>
                        <div style={{ width: '24px', height: '24px', left: '0px', top: '0px', position: 'absolute', overflow: 'hidden' }}>
                          <div style={{ width: '16.83px', height: '16.83px', left: '3.60px', top: '3.57px', position: 'absolute', background: 'var(--gray-50, #F9FAFB)' }}></div>
                        </div>
                      </div>
                    </div>
                    <div onClick={() => handleDeleteOption(index)} style={{ padding: '4px', background: 'var(--red-400, #F98080)', borderRadius: '9999px', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer' }}>
                      <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '18px', height: '20px', left: '3px', top: '2px', position: 'absolute', background: 'var(--white, white)', border: '1px var(--white, white) solid' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', outline: '1px var(--gray-400, #9CA3AF) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'inline-flex', marginTop: '24px', cursor: 'pointer' }} onClick={handleAddOption}>
              <div style={{ width: '16px', height: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '9.33px', height: '9.33px', left: '3.33px', top: '3.33px', position: 'absolute', background: 'var(--gray-50, #F9FAFB)', outline: '2px var(--gray-50, #F9FAFB) solid', outlineOffset: '-1px' }}></div>
              </div>
              <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>Добавить вариант</div>
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div style={{ width: '1175px', paddingLeft: '145px', paddingRight: '145px', paddingTop: '24px', paddingBottom: '24px', position: 'fixed', bottom: '0', left: '264px', background: 'var(--gray-800, #1F2A37)', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '10px', display: 'inline-flex' }}>
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex' }}>
            <div style={{ width: '225px', padding: '10px', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex' }}></div>
            <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: '16px', display: 'flex' }}>
              <div onClick={handleBack} style={{ width: '225px', paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '8px', outline: '1px var(--gray-400, #9CA3AF) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'flex', cursor: 'pointer' }}>
                <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>Назад</div>
              </div>
              <div onClick={handleSave} style={{ width: '225px', paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', paddingBottom: '10px', background: hasChanges ? 'var(--primary-700, #FBE54D)' : 'var(--gray-600, #4B5563)', overflow: 'hidden', borderRadius: '8px', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'flex', cursor: hasChanges ? 'pointer' : 'not-allowed' }}>
                <div style={{ color: hasChanges ? 'var(--gray-900, #111928)' : 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>Сохранить и опубликовать</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MortgageDropdownEdit;