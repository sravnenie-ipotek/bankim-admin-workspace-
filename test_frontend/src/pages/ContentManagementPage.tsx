import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import SharedHeader from '../components/SharedHeader';
import './ContentManagementPage.css';
import { Table } from '../components/Table';
import { TextEditModal, TextEditData, DropdownEditModal, DropdownEditData, LinkEditModal, LinkEditData } from '../components/ContentEditModals';
import { apiService, ContentItem } from '../services/api';

interface PageState {
  id: string;
  name: string;
  thumbnail: string;
}

interface SelectedAction {
  id: string;
  actionName: string;
  type: 'dropdown' | 'link' | 'text';
}

const mockPageStates: PageState[] = [
  { id: '1', name: 'Main', thumbnail: '' },
  { id: '2', name: 'State 2', thumbnail: '' },
  { id: '3', name: 'State 3', thumbnail: '' },
  { id: '4', name: 'State 4', thumbnail: '' },
  { id: '5', name: 'State 5', thumbnail: '' },
  { id: '6', name: 'State 6', thumbnail: '' },
];


const ContentManagementPage: React.FC = () => {
  const [activeState, setActiveState] = useState(mockPageStates[0]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isDropdownModalOpen, setIsDropdownModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
  
  // Real data state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch content items using API service
        const contentResponse = await apiService.getContentItems();

        if (contentResponse.success && contentResponse.data) {
          setContentItems(contentResponse.data);
          setError(null);
        } else {
          console.error('Failed to fetch content items:', contentResponse.error);
          setError('Failed to load content data');
        }
      } catch (err) {
        console.error('Error fetching content data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' |');
  };


  const handleCloseModals = () => {
    setIsTextModalOpen(false);
    setIsDropdownModalOpen(false);
    setIsLinkModalOpen(false);
    setSelectedAction(null);
  };

  const handleSaveText = (data: TextEditData) => {
    console.log('Saving text data:', data);
    // Here you would typically make an API call to save the data
    handleCloseModals();
  };

  const handleSaveDropdown = (data: DropdownEditData) => {
    console.log('Saving dropdown data:', data);
    // Here you would typically make an API call to save the data
    handleCloseModals();
  };

  const handleSaveLink = (data: LinkEditData) => {
    console.log('Saving link data:', data);
    // Here you would typically make an API call to save the data
    handleCloseModals();
  };

  // Transform ContentItem data to match Table component format
  const transformedActionsData = contentItems.map((item) => {
    const ruTranslation = item.translations.find(t => t.language_code === 'ru');
    const heTranslation = item.translations.find(t => t.language_code === 'he');
    const enTranslation = item.translations.find(t => t.language_code === 'en');
    
    const displayText = ruTranslation?.content_value || 
                       enTranslation?.content_value || 
                       heTranslation?.content_value || 
                       item.content_key;

    return {
      id: item.id,
      name: displayText,
      type: { 
        text: item.content_type === 'dropdown' ? 'Дропдаун' : 
              item.content_type === 'link' ? 'Ссылка' : 
              item.content_type === 'button' ? 'Кнопка' : 'Текст', 
        type: 'inactive' as const 
      },
      status: { 
        text: item.is_active ? 'Активен' : 'Неактивен', 
        type: item.is_active ? 'active' as const : 'inactive' as const 
      },
      access: { 
        text: 'Полный', 
        type: 'active' as const 
      },
      actions: { 
        text: 'Редактировать', 
        type: 'active' as const 
      }
    };
  });

  // Calculate page info from real data
  const pageInfo = {
    name: 'Главная страница',
    id: '1021231231',
    totalActions: contentItems.length,
    lastModified: contentItems.length > 0 ? contentItems[0].updated_at : new Date().toISOString()
  };


  if (loading) {
    return (
      <AdminLayout title="Контент сайта">
        <SharedHeader />
        <div className="content-management-page">
          <div className="page-content-wrapper">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Загрузка контента...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Контент сайта">
        <SharedHeader />
        <div className="content-management-page">
          <div className="page-content-wrapper">
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <p>Ошибка загрузки: {error}</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Контент сайта">
      <SharedHeader />
      <div className="content-management-page">
        <div className="page-content-wrapper">
          {/* Breadcrumbs and Page Header */}
          <section className="page-header-section">
            <div className="breadcrumbs">
              <span>Контент сайта</span>
              <img src="/src/assets/images/static/carret-right.svg" alt=">" className="breadcrumb-separator" />
              <span>Главная</span>
              <img src="/src/assets/images/static/carret-right.svg" alt=">" className="breadcrumb-separator" />
              <span className="active">{pageInfo.name}</span>
            </div>
            <h1 className="main-title">{pageInfo.name}</h1>
            <div className="info-cards">
              <div className="info-card">
                <span className="info-card-label">Количество действий</span>
                <span className="info-card-value">{pageInfo.totalActions}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Последнее редактирование</span>
                <span className="info-card-value">{formatDateTime(pageInfo.lastModified)}</span>
              </div>
            </div>
          </section>

          {/* Page States Gallery */}
          <section className="gallery-section">
            <h2 className="section-title">Страница и ее состояния</h2>
            <div className="main-image-container">
                <div className="main-preview-placeholder">
                  <div className="preview-content">
                    <div className="preview-header">
                      <span className="preview-title">🏠 Главная страница</span>
                    </div>
                    <div className="preview-body">
                      <div className="preview-section">
                        <div className="preview-card">
                          <h3>Добро пожаловать в BankIM</h3>
                          <p>Ваш надежный партнер в мире финансов</p>
                        </div>
                      </div>
                      <div className="preview-section">
                        <div className="preview-card">
                          <h3>Наши услуги</h3>
                          <div className="services-grid">
                            <span>Ипотека</span>
                            <span>Кредиты</span>
                            <span>Вклады</span>
                            <span>Консультации</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            <div className="carousel-container">
              <button className="carousel-nav-button" aria-label="Previous State">
                <img src="/src/assets/images/static/carret-left.svg" alt="<" />
              </button>
              <div className="carousel-track">
                {mockPageStates.map(state => (
                  <div 
                    key={state.id} 
                    className={`thumbnail-container ${state.id === activeState.id ? 'active' : ''}`}
                    onClick={() => setActiveState(state)}
                  >
                    <div 
                      className="thumbnail-placeholder"
                      style={{
                        backgroundColor: '#2A2D3A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '80px',
                        border: '1px solid #3A3D4A',
                        borderRadius: '4px'
                      }}
                    >
                      <span style={{ color: '#8B8FA3', fontSize: '12px' }}>State {state.id}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-nav-button" aria-label="Next State">
                <img src="/src/assets/images/static/carret-right.svg" alt=">" />
              </button>
            </div>
          </section>

          {/* Actions Table */}
          <section className="actions-table-section">
            <h2 className="section-title">Список действий на странице</h2>
            <div className="table-wrapper">
              <div className="table-controls">
                <div className="search-input-wrapper">
                  <img src="/assets/images/static/search-outline.svg" alt="Search" className="search-icon" />
                  <input type="text" placeholder="Искать по действию" className="search-input" />
                </div>
                <button className="filter-button">
                  <img src="/assets/images/static/adjustments-horizontal.svg" alt="Filters" className="filter-icon" />
                  Фильтры
                </button>
              </div>
              <Table data={transformedActionsData} />
              <div className="table-pagination">
                 <span>Показывает 1-{Math.min(12, contentItems.length)} из {contentItems.length}</span>
                 <div className="pagination-controls">
                    <button className="page-nav-button"><img src="/assets/images/static/carret-left.svg" alt="<" /></button>
                    <button className="page-number-button active">1</button>
                    <button className="page-number-button">2</button>
                    <button className="page-number-button">3</button>
                    <button className="page-number-button">...</button>
                    <button className="page-number-button">100</button>
                    <button className="page-nav-button"><img src="/assets/images/static/carret-right.svg" alt=">" /></button>
                 </div>
              </div>
            </div>
          </section>
        </div>
        
        {isTextModalOpen && selectedAction && (
          <TextEditModal
            isOpen={isTextModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveText}
            actionName={selectedAction.actionName}
          />
        )}
        {isDropdownModalOpen && selectedAction && (
          <DropdownEditModal
            isOpen={isDropdownModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveDropdown}
            actionName={selectedAction.actionName}
          />
        )}
        {isLinkModalOpen && selectedAction && (
          <LinkEditModal
            isOpen={isLinkModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveLink}
            actionName={selectedAction.actionName}
          />
        )}

      </div>
    </AdminLayout>
  );
};

export default ContentManagementPage; 