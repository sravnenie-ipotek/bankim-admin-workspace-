import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SharedHeader from '../components/SharedHeader';
import { Table } from '../components/Table';
import { useNavigate } from 'react-router-dom';
import './ContentListPage.css';

interface ContentPage {
  id: string;
  number: number;
  name: string;
  path: string;
  category: string;
  actionsCount: number;
  status: 'Published' | 'Draft';
  lastModified: string;
  modifiedBy: string;
}

const mockPages: ContentPage[] = [
  {
    id: 'main-page',
    number: 1,
    name: 'Главная страница',
    path: '/',
    category: 'Главная',
    actionsCount: 12,
    status: 'Published',
    lastModified: '10.12.2024, 02:00',
    modifiedBy: 'director-1',
  },
  {
    id: 'menu',
    number: 2,
    name: 'Меню сайта',
    path: '/menu',
    category: 'Меню',
    actionsCount: 9,
    status: 'Published',
    lastModified: '12.12.2024, 02:00',
    modifiedBy: 'director-1',
  },
  {
    id: 'calculate-mortgage',
    number: 3,
    name: 'Рассчитать ипотеку',
    path: '/calculate-mortgage',
    category: 'Ипотека',
    actionsCount: 15,
    status: 'Draft',
    lastModified: '11.12.2024, 02:00',
    modifiedBy: 'director-1',
  },
];

const ContentListPage: React.FC = () => {
    const navigate = useNavigate();

    const handleRowClick = (page: ContentPage) => {
        navigate(`/content/${page.id}`);
    };
    
    const columns = [
        { Header: '№', accessor: 'number' },
        { Header: 'НАЗВАНИЕ', accessor: 'name', Cell: ({ row }: any) => (
            <div>
                <div className="page-name">{row.original.name}</div>
                <div className="page-path">{row.original.path}</div>
            </div>
        )},
        { Header: 'КАТЕГОРИЯ', accessor: 'category' },
        { Header: 'ДЕЙСТВИЯ', accessor: 'actionsCount', Cell: ({ value }: any) => <div className="actions-count-cell"><span className="actions-count-badge">{value}</span></div> },
        { Header: 'СТАТУС', accessor: 'status', Cell: ({ value }: any) => <span className={`status-badge ${value.toLowerCase()}`}>{value}</span> },
        { Header: 'ИЗМЕНЕНО', accessor: 'lastModified', Cell: ({ row }: any) => (
            <div>
                <div>{row.original.lastModified}</div>
                <div className="modified-by">изм. {row.original.modifiedBy}</div>
            </div>
        )},
        { Header: 'ДЕЙСТВИЯ', accessor: 'actions', Cell: ({ row }: any) => (
            <div className="action-buttons">
              <button className="action-btn view-btn" onClick={(e) => { e.stopPropagation(); alert('View page'); }}></button>
              <button className="action-btn edit-btn" onClick={(e) => { e.stopPropagation(); handleRowClick(row.original); }}></button>
              <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); alert('Delete page'); }}></button>
            </div>
          )},
      ];

  return (
    <AdminLayout>
      <SharedHeader title="Контент сайта" subtitle="Управление контентом и страницами сайта" />
      <div className="content-list-page">
        <div className="page-list-container">
            <div className="page-list-header">
                <input type="text" placeholder="Поиск по названию, ID или номеру страницы..." className="search-input" />
                {/* Add dropdowns here */}
            </div>
            <h3>Список страниц</h3>
            <Table columns={columns} data={mockPages} onRowClick={handleRowClick} />
            <div className="page-list-footer">
                Показано {mockPages.length} записей
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentListPage; 