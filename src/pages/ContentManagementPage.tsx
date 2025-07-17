import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import SharedHeader from '../components/SharedHeader';
import './ContentManagementPage.css';
import { Table } from '../components/Table';
import { TextEditModal, TextEditData, DropdownEditModal, DropdownEditData, LinkEditModal, LinkEditData } from '../components/ContentEditModals';


// --- Data Interfaces ---
interface PageInfo {
  name: string;
  id: string;
  totalActions: number;
  lastModified: string;
}

interface PageState {
  id: string;
  name: string;
  thumbnail: string;
}

interface PageAction {
  actionNumber: number;
  id: string;
  type: 'dropdown' | 'link' | 'text';
  ru: string;
  heb: string;
}

interface SelectedAction extends PageAction {
  actionName: string;
}

// --- Mock Data ---
const mockPageInfo: PageInfo = {
  name: 'Калькулятор ипотеки Страница №2',
  id: '1021231231', // Example ID
  totalActions: 33,
  lastModified: '2023-08-01T12:03:00Z',
};

const mockPageStates: PageState[] = [
  { id: '1', name: 'Main', thumbnail: '/assets/images/static/calculate-mortgage/main-preview.png' },
  { id: '2', name: 'State 2', thumbnail: '/assets/images/static/calculate-mortgage/state2-preview.png' },
  { id: '3', name: 'State 3', thumbnail: '/assets/images/static/calculate-mortgage/state3-preview.png' },
];

const mockActions: PageAction[] = [
  { actionNumber: 1, id: 'Income_Main', type: 'dropdown', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 2, id: 'Income_Main_2', type: 'link', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 3, id: 'Income_Main_3', type: 'link', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 4, id: 'Income_Main_4', type: 'text', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 5, id: 'Income_Main_5', type: 'text', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 6, id: 'Income_Main_6', type: 'text', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 7, id: 'Income_Main_7', type: 'text', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 8, id: 'Income_Main_8', type: 'text', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 9, id: 'Income_Main_9', type: 'dropdown', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 10, id: 'Income_Main_10', type: 'dropdown', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 11, id: 'Income_Main_11', type: 'text', ru: 'Заголовок', heb: 'כותרת' },
  { actionNumber: 12, id: 'Income_Main_12', type: 'dropdown', ru: 'Рассчитать Ипотеку', heb: 'חשב את המשכנתא שלך' },
  { actionNumber: 13, id: 'Income_Main_13', type: 'link', ru: 'Подробнее', heb: 'למידע נוסף' },
];


const ContentManagementPage: React.FC = () => {
  const [activeState, setActiveState] = useState(mockPageStates[0]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isDropdownModalOpen, setIsDropdownModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);

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

  const handleEditClick = (action: PageAction) => {
    const actionName = `${action.ru} / ${action.heb}`;
    setSelectedAction({ ...action, actionName });
    if (action.type === 'text') {
      setIsTextModalOpen(true);
    } else if (action.type === 'dropdown') {
      setIsDropdownModalOpen(true);
    } else if (action.type === 'link') {
      setIsLinkModalOpen(true);
    }
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

  const columns = [
    { key: 'actionNumber', title: 'Номер действия' },
    { key: 'id', title: 'ID' },
    { key: 'type', title: 'Тип', render: (item: PageAction) => (
      <span className={`type-label type-${item.type}`}>
        {item.type === 'dropdown' ? 'Дропдаун' : item.type === 'link' ? 'Ссылка' : 'Текст'}
      </span>
    )},
    { key: 'ru', title: 'RU' },
    { key: 'heb', title: 'HEB', render: (item: PageAction) => <span style={{ direction: 'rtl', textAlign: 'right', display: 'block' }}>{item.heb}</span> },
    { key: 'edit', title: '', render: (item: PageAction) => (
      <button className="edit-button" aria-label={`Edit ${item.id}`} onClick={() => handleEditClick(item)}>
        {item.type === 'text' || item.type === 'link' ? (
          <img src="/assets/images/static/calculate-credit/pencilsimple1132-cw1.svg" alt="Edit" />
        ) : (
          <img src="/assets/images/static/carret-right.svg" alt="View" />
        )}
      </button>
    )}
  ];


  return (
    <AdminLayout>
      <SharedHeader title="Контент сайта" />
      <div className="content-management-page">
        <div className="page-content-wrapper">
          {/* Breadcrumbs and Page Header */}
          <section className="page-header-section">
            <div className="breadcrumbs">
              <span>Контент сайта</span>
              <img src="/assets/images/static/carret-right.svg" alt=">" className="breadcrumb-separator" />
              <span>Главная</span>
              <img src="/assets/images/static/carret-right.svg" alt=">" className="breadcrumb-separator" />
              <span className="active">{mockPageInfo.name}</span>
            </div>
            <h1 className="main-title">{mockPageInfo.name}</h1>
            <div className="info-cards">
              <div className="info-card">
                <span className="info-card-label">Количество действий</span>
                <span className="info-card-value">{mockPageInfo.totalActions}</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Последнее редактирование</span>
                <span className="info-card-value">{formatDateTime(mockPageInfo.lastModified)}</span>
              </div>
            </div>
          </section>

          {/* Page States Gallery */}
          <section className="gallery-section">
            <h2 className="section-title">Cтраница и ее состояния</h2>
            <div className="main-image-container">
                <img src={activeState.thumbnail} alt={activeState.name} className="main-preview-image" />
            </div>
            <div className="carousel-container">
              <button className="carousel-nav-button" aria-label="Previous State">
                <img src="/assets/images/static/carret-left.svg" alt="<" />
              </button>
              <div className="carousel-track">
                {mockPageStates.map(state => (
                  <div 
                    key={state.id} 
                    className={`thumbnail-container ${state.id === activeState.id ? 'active' : ''}`}
                    onClick={() => setActiveState(state)}
                  >
                    <img src={state.thumbnail} alt={state.name} className="thumbnail-image" />
                  </div>
                ))}
              </div>
              <button className="carousel-nav-button" aria-label="Next State">
                <img src="/assets/images/static/carret-right.svg" alt=">" />
              </button>
            </div>
          </section>

          {/* Actions Table */}
          <section className="actions-table-section">
            <h2 className="section-title">Cписок действий на странице</h2>
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
              <Table data={mockActions} columns={columns} />
              <div className="table-pagination">
                 <span>Показывает 1-12 из {mockActions.length}</span>
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