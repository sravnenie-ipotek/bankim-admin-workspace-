/**
 * Table Component
 * Bank Data Table for the BankIM Management Portal
 * 
 * Based on Figma Design specifications with exact dimensions:
 * - Table width: 925px, height: 507px
 * - Background: #1F2A37 (gray/800)
 * - Header height: 74px with search, date picker, and filter
 * - Column widths: 172px, 167px, 202px, 185px, 199px
 * - Cell heights: 50px (header), 54px (data)
 * - Status badges with color coding
 * - Arimo font family throughout
 * 
 * Features:
 * - Search input with icon
 * - Date picker (hidden by default)
 * - Filter button with adjustments icon
 * - Status badges (Active, Inactive, Pending, etc.)
 * - Responsive design
 * - Accessibility support
 */

import React, { useState } from 'react';
import './Table.css';

// TypeScript interfaces
interface StatusBadge {
  text: string;
  type: 'active' | 'inactive' | 'pending' | 'blocked' | 'verification';
}

interface TableRow {
  id: string;
  name: string;
  type: StatusBadge;
  status: StatusBadge;
  access: StatusBadge;
  actions: StatusBadge;
}

interface TableProps {
  data?: TableRow[];
  onSearch?: (query: string) => void;
  onDateFilter?: (date: string) => void;
  onFilter?: () => void;
  className?: string;
}

// Sample data matching the Figma design
const defaultData: TableRow[] = [
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
  }
];

const Table: React.FC<TableProps> = ({
  data = defaultData,
  onSearch,
  onDateFilter,
  onFilter,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker] = useState(false); // Used in datepicker className

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    onDateFilter?.(date);
  };

  const handleFilterClick = () => {
    onFilter?.();
  };

  const renderStatusBadge = (badge: StatusBadge) => {
    return (
      <div className={`badge badge--${badge.type}`}>
        <span className="badge__text">{badge.text}</span>
      </div>
    );
  };

  return (
    <div className={`table-bank ${className}`}>
      {/* Table Header */}
      <div className="table-header">
        <div className="table-header__content">
          {/* Search Input */}
          <div className="input-field">
            <div className="input-field__wrapper">
              <div className="input-content">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                    stroke="#9CA3AF"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Search banks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search banks"
                />
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className={`datepicker ${showDatePicker ? 'datepicker--visible' : ''}`}>
            <div className="datepicker__content">
              <svg className="calendar-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M14.25 3H3.75A1.125 1.125 0 0 0 2.625 4.125v9a1.125 1.125 0 0 0 1.125 1.125h10.5a1.125 1.125 0 0 0 1.125-1.125v-9A1.125 1.125 0 0 0 14.25 3ZM6.75 1.125v2.25M11.25 1.125v2.25M2.625 6.75h12.75"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <input
                type="date"
                className="date-input"
                onChange={handleDateChange}
                aria-label="Select date"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button className="filter-button" onClick={handleFilterClick} aria-label="Open filters">
            <svg className="adjustments-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2.5 8h3M8.5 8h5M5.5 4.5v7M10.5 4.5v7M2.5 4.5h5M10.5 11.5h3"
                stroke="#F9FAFB"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="filter-button__text">Filters</span>
          </button>
        </div>
      </div>

      {/* Table Columns */}
      <div className="table-columns">
        {/* Column 1 - Names */}
        <div className="column column--names">
          <div className="table-cell table-cell--header">
            <span className="header-text">BANK NAME</span>
          </div>
          <div className="border-bottom"></div>
          {data.map((row) => (
            <React.Fragment key={`name-${row.id}`}>
              <div className="table-cell table-cell--data">
                <span className="data-text">{row.name}</span>
              </div>
              <div className="border-bottom"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Column 2 - Type */}
        <div className="column column--type">
          <div className="table-cell table-cell--header">
            <span className="header-text">TYPE</span>
          </div>
          <div className="border-bottom"></div>
          {data.map((row) => (
            <React.Fragment key={`type-${row.id}`}>
              <div className="table-cell table-cell--data">
                {renderStatusBadge(row.type)}
              </div>
              <div className="border-bottom"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Column 3 - Status */}
        <div className="column column--status">
          <div className="table-cell table-cell--header">
            <span className="header-text">STATUS</span>
          </div>
          <div className="border-bottom"></div>
          {data.map((row) => (
            <React.Fragment key={`status-${row.id}`}>
              <div className="table-cell table-cell--data">
                {renderStatusBadge(row.status)}
              </div>
              <div className="border-bottom"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Column 4 - Access */}
        <div className="column column--access">
          <div className="table-cell table-cell--header">
            <span className="header-text">ACCESS</span>
          </div>
          <div className="border-bottom"></div>
          {data.map((row) => (
            <React.Fragment key={`access-${row.id}`}>
              <div className="table-cell table-cell--data">
                {renderStatusBadge(row.access)}
              </div>
              <div className="border-bottom"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Column 5 - Actions */}
        <div className="column column--actions">
          <div className="table-cell table-cell--header">
            <span className="header-text">ACTIONS</span>
          </div>
          <div className="border-bottom"></div>
          {data.map((row) => (
            <React.Fragment key={`actions-${row.id}`}>
              <div className="table-cell table-cell--data">
                {renderStatusBadge(row.actions)}
              </div>
              <div className="border-bottom"></div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Table Footer */}
      <div className="table-footer">
        <button className="view-all-button">
          Посмотреть все
        </button>
      </div>
    </div>
  );
};

export default Table; 