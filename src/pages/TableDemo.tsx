/**
 * TableDemo Page
 * Demonstration of the Table component with bank data
 * 
 * This page showcases the Table component functionality including:
 * - Search functionality
 * - Date filtering
 * - Status badges
 * - Exact Figma design implementation
 * - Responsive behavior
 */

import React, { useState } from 'react';
import { Table } from '../components';
import './TableDemo.css';

interface TableRow {
  id: string;
  name: string;
  type: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  status: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  access: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
  actions: { text: string; type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification' };
}

const TableDemo: React.FC = () => {
  const [searchResults, setSearchResults] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [filterMessage, setFilterMessage] = useState<string>('');

  // Extended sample data for demonstration
  const sampleData: TableRow[] = [
    {
      id: '1',
      name: 'Bank Mizrahi-Tefahot',
      type: { text: 'Private', type: 'inactive' },
      status: { text: 'Active', type: 'active' },
      access: { text: 'Full', type: 'active' },
      actions: { text: 'Waiting for approval', type: 'pending' }
    },
    {
      id: '2',
      name: 'Bank Hapoalim',
      type: { text: 'Commercial', type: 'inactive' },
      status: { text: 'Active', type: 'active' },
      access: { text: 'Full', type: 'active' },
      actions: { text: 'Approved successfully', type: 'active' }
    },
    {
      id: '3',
      name: 'Bank Leumi',
      type: { text: 'Private', type: 'inactive' },
      status: { text: 'Active', type: 'active' },
      access: { text: 'Full', type: 'active' },
      actions: { text: 'Approved successfully', type: 'active' }
    },
    {
      id: '4',
      name: 'Israel Discount Bank',
      type: { text: 'Commercial', type: 'inactive' },
      status: { text: 'Verification needed', type: 'blocked' },
      access: { text: 'Verification needed', type: 'blocked' },
      actions: { text: 'Verification needed', type: 'blocked' }
    },
    {
      id: '5',
      name: 'First International Bank',
      type: { text: 'Private', type: 'inactive' },
      status: { text: 'Waiting for approval', type: 'pending' },
      access: { text: 'Waiting for approval', type: 'pending' },
      actions: { text: 'Waiting for approval', type: 'pending' }
    },
    {
      id: '6',
      name: 'Mercantile Discount Bank',
      type: { text: 'Commercial', type: 'inactive' },
      status: { text: 'Waiting for approval', type: 'pending' },
      access: { text: 'Waiting for approval', type: 'pending' },
      actions: { text: 'Waiting for approval', type: 'pending' }
    },
    {
      id: '7',
      name: 'Bank of Jerusalem',
      type: { text: 'Private', type: 'inactive' },
      status: { text: 'Active', type: 'active' },
      access: { text: 'Limited', type: 'pending' },
      actions: { text: 'Access review needed', type: 'pending' }
    },
    {
      id: '8',
      name: 'Union Bank of Israel',
      type: { text: 'Commercial', type: 'inactive' },
      status: { text: 'Blocked', type: 'blocked' },
      access: { text: 'Blocked', type: 'blocked' },
      actions: { text: 'Security review required', type: 'blocked' }
    }
  ];

  const handleSearch = (query: string) => {
    setSearchResults(query ? `Searching for: "${query}"` : '');
    console.log('Search query:', query);
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date ? `Date filter: ${date}` : '');
    console.log('Date filter:', date);
  };

  const handleFilter = () => {
    setFilterMessage('Filters menu opened');
    console.log('Filter button clicked');
    // Clear message after 3 seconds
    setTimeout(() => setFilterMessage(''), 3000);
  };

  return (
    <div className="table-demo">
      <div className="demo-header">
        <h1 className="demo-title">Bank Data Table - Component Demo</h1>
        <p className="demo-description">
          This table component is built to exact Figma specifications with precise dimensions,
          colors, typography, and spacing. It includes search functionality, date filtering,
          status badges, and responsive design.
        </p>
        
        {/* Status Messages */}
        <div className="demo-status">
          {searchResults && (
            <div className="status-message status-message--search">
              🔍 {searchResults}
            </div>
          )}
          {dateFilter && (
            <div className="status-message status-message--date">
              📅 {dateFilter}
            </div>
          )}
          {filterMessage && (
            <div className="status-message status-message--filter">
              ⚙️ {filterMessage}
            </div>
          )}
        </div>
      </div>

      <div className="demo-content">
        <Table
          data={sampleData}
          onSearch={handleSearch}
          onDateFilter={handleDateFilter}
          onFilter={handleFilter}
          className="demo-table"
        />
      </div>

      <div className="demo-footer">
        <div className="demo-specs">
          <h3>Design Specifications</h3>
          <ul>
            <li><strong>Dimensions:</strong> 925px × 507px</li>
            <li><strong>Background:</strong> #1F2A37 (gray/800)</li>
            <li><strong>Typography:</strong> Arimo font family</li>
            <li><strong>Column Widths:</strong> 172px, 167px, 202px, 185px, 199px</li>
            <li><strong>Status Colors:</strong> Green (#31C48D), Yellow (#FACA15), Red (#F98080)</li>
            <li><strong>Border Radius:</strong> 8px with subtle shadow</li>
          </ul>
        </div>
        
        <div className="demo-features">
          <h3>Features</h3>
          <ul>
            <li>🔍 Real-time search functionality</li>
            <li>📅 Date filtering capability</li>
            <li>🏷️ Color-coded status badges</li>
            <li>📱 Responsive design</li>
            <li>♿ Accessibility support</li>
            <li>🎨 Pixel-perfect Figma implementation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TableDemo; 