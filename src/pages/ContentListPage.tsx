import React from 'react';
import AdminLayout from '../components/AdminLayout';
import SharedHeader from '../components/SharedHeader';
import { Table } from '../components/Table';
import './ContentListPage.css';

interface TableRow {
  id: string;
  name: string;
  type: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  status: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  access: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  actions: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
}

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
  type: string;
  access: string;
  actions: string;
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
    type: 'page',
    access: 'public',
    actions: 'edit',
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
    type: 'page',
    access: 'public',
    actions: 'edit',
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
    type: 'page',
    access: 'public',
    actions: 'edit',
  },
];

const ContentListPage: React.FC = () => {
    // Transform ContentPage data to TableRow format
    const transformedData: TableRow[] = mockPages.map(page => ({
        id: page.id,
        name: page.name,
        type: { text: page.type, type: 'inactive' as const },
        status: { text: page.status, type: page.status === 'Published' ? 'active' as const : 'pending' as const },
        access: { text: page.access, type: 'active' as const },
        actions: { text: page.actions, type: 'active' as const }
    }));

  return (
    <AdminLayout title="Контент сайта">
      <SharedHeader />
      <div className="content-list-page">
        <div className="page-list-container">
            <div className="page-list-header">
                <input type="text" placeholder="Поиск по названию, ID или номеру страницы..." className="search-input" />
                {/* Add dropdowns here */}
            </div>
            <h3>Список страниц</h3>
            <Table data={transformedData} />
            <div className="page-list-footer">
                Показано {mockPages.length} записей
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentListPage; 