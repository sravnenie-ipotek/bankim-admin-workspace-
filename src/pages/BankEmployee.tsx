import React, { useState, useEffect } from 'react'
import { SharedHeader, SharedMenu } from '../components'
import './BankEmployee.css'

// Mock client data
const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'Иван Петров',
    service: 'Ипотека',
    applicationStatus: 'Готова',
    requestStatus: 'Ждет предложение',
    documentStatus: 'Готовы',
    phone: '+972-50-123-4567',
    passport: 'AB1234567',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Мария Козлова',
    service: 'Рефинансирование ипотеки',
    applicationStatus: 'Требует проверки',
    requestStatus: 'Предложение отправлено',
    documentStatus: 'Документы корректируются',
    phone: '+972-50-234-5678',
    passport: 'CD2345678',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    name: 'Александр Сидоров',
    service: 'Кредит',
    applicationStatus: 'Анкета корректируется',
    requestStatus: 'Заявка не завершена',
    documentStatus: 'Требуют проверки',
    phone: '+972-50-345-6789',
    passport: 'EF3456789',
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    name: 'Елена Морозова',
    service: 'Рефинансирование кредита',
    applicationStatus: 'Готова',
    requestStatus: 'Ждет предложение',
    documentStatus: 'Готовы',
    phone: '+972-50-456-7890',
    passport: 'GH4567890',
    createdAt: '2024-01-12'
  },
  {
    id: 5,
    name: 'Дмитрий Волков',
    service: 'Ипотека',
    applicationStatus: 'Требует проверки',
    requestStatus: 'Отказано клиенту',
    documentStatus: 'Готовы',
    phone: '+972-50-567-8901',
    passport: 'IJ5678901',
    createdAt: '2024-01-11'
  }
]

// Filter options from Confluence documentation
const FILTER_OPTIONS = {
  service: ['Ипотека', 'Рефинансирование ипотеки', 'Кредит', 'Рефинансирование кредита'],
  requestStatus: ['Предложение отправлено', 'Заявка не завершена', 'Отказано клиенту', 'Ждет предложение'],
  applicationStatus: ['Готова', 'Анкета корректируется', 'Требует проверки'],
  documentStatus: ['Готовы', 'Документы корректируются', 'Требуют проверки']
}

const BankEmployee: React.FC = () => {
  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [filteredClients, setFilteredClients] = useState(MOCK_CLIENTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedFilters, setSelectedFilters] = useState({
    service: [] as string[],
    requestStatus: [] as string[],
    applicationStatus: [] as string[],
    documentStatus: [] as string[]
  })

  // Search functionality (Action #2)
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term) {
      setFilteredClients(clients)
      return
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(term.toLowerCase()) ||
      client.phone.includes(term) ||
      client.passport.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredClients(filtered)
  }

  // Filter functionality (Actions #4, #9-#24)
  const handleFilterChange = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  // Apply filters (Action #25)
  const applyFilters = () => {
    let filtered = clients

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.passport.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply service filter
    if (selectedFilters.service.length > 0) {
      filtered = filtered.filter(client => selectedFilters.service.includes(client.service))
    }

    // Apply request status filter
    if (selectedFilters.requestStatus.length > 0) {
      filtered = filtered.filter(client => selectedFilters.requestStatus.includes(client.requestStatus))
    }

    // Apply application status filter
    if (selectedFilters.applicationStatus.length > 0) {
      filtered = filtered.filter(client => selectedFilters.applicationStatus.includes(client.applicationStatus))
    }

    // Apply document status filter
    if (selectedFilters.documentStatus.length > 0) {
      filtered = filtered.filter(client => selectedFilters.documentStatus.includes(client.documentStatus))
    }

    setFilteredClients(filtered)
    setCurrentPage(1)
    setShowFilters(false)
  }

  // Pagination (Action #28)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Готова':
      case 'Готовы':
      case 'Предложение отправлено':
        return 'status-success'
      case 'Требует проверки':
      case 'Требуют проверки':
      case 'Ждет предложение':
        return 'status-warning'
      case 'Анкета корректируется':
      case 'Документы корректируются':
      case 'Заявка не завершена':
        return 'status-pending'
      case 'Отказано клиенту':
        return 'status-error'
      default:
        return 'status-default'
    }
  }

  return (
    <div className="bank-employee-page">
      <SharedMenu 
        userRole="bank-employee"
        showAdminSections={true}
      />
      
      <div className="main-content">
        <SharedHeader 
          title="Сотрудник банка"
          navigateTo="/"
          confirmNavigation={false}
        />
        
        {/* Page Content */}
        <div className="page-content">
        <div className="page-header">
          <h1>🏛️ Сотрудник банка</h1>
          <p className="page-subtitle">Управление клиентами и заявками</p>
        </div>

      {/* Search and Filters Section */}
      <div className="controls-section">
        {/* Search (Action #2) */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Поиск по имени, телефону или паспорту..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Filters Button (Action #4) */}
        <button
          className="filters-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          🔽 Фильтры
        </button>

        {/* Client Count (Action #26) */}
        <div className="client-count">
          Найдено клиентов: <strong>{filteredClients.length}</strong>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            {/* Service Filter (Actions #9-#11) */}
            <div className="filter-category">
              <h3 className="filter-title">Услуга</h3>
              {FILTER_OPTIONS.service.map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.service.includes(option)}
                    onChange={() => handleFilterChange('service', option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Request Status Filter (Actions #12-#16) */}
            <div className="filter-category">
              <h3 className="filter-title">Статус заявки</h3>
              {FILTER_OPTIONS.requestStatus.map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.requestStatus.includes(option)}
                    onChange={() => handleFilterChange('requestStatus', option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Application Status Filter (Actions #17-#20) */}
            <div className="filter-category">
              <h3 className="filter-title">Статус анкеты</h3>
              {FILTER_OPTIONS.applicationStatus.map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.applicationStatus.includes(option)}
                    onChange={() => handleFilterChange('applicationStatus', option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Document Status Filter (Actions #21-#24) */}
            <div className="filter-category">
              <h3 className="filter-title">Статус документов</h3>
              {FILTER_OPTIONS.documentStatus.map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.documentStatus.includes(option)}
                    onChange={() => handleFilterChange('documentStatus', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Apply Filters Button (Action #25) */}
          <div className="filters-actions">
            <button className="apply-filters-button" onClick={applyFilters}>
              Применить фильтры
            </button>
            <button 
              className="reset-filters-button" 
              onClick={() => {
                setSelectedFilters({
                  service: [],
                  requestStatus: [],
                  applicationStatus: [],
                  documentStatus: []
                })
                setFilteredClients(clients)
              }}
            >
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="table-container">
        <table className="clients-table">
          <thead>
            <tr>
              {/* Column Headers */}
              <th>Имя фамилия</th> {/* Action #1 */}
              <th>Услуга</th> {/* Action #8 */}
              <th>Статус анкеты</th> {/* Action #3 */}
              <th>Статус заявки</th> {/* Action #5 */}
              <th>Статус документов</th> {/* Action #6 */}
              <th>Телефон</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(client => (
              <tr key={client.id}>
                <td className="client-name">{client.name}</td>
                <td>
                  <span className="service-badge">{client.service}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(client.applicationStatus)}`}>
                    {client.applicationStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(client.requestStatus)}`}>
                    {client.requestStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(client.documentStatus)}`}>
                    {client.documentStatus}
                  </span>
                </td>
                <td>{client.phone}</td>
                <td>{client.createdAt}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-button" title="Посмотреть все">
                      👁️
                    </button>
                    <button className="edit-button" title="Редактировать">
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No results message */}
        {filteredClients.length === 0 && (
          <div className="no-results">
            <p>Клиенты не найдены</p>
          </div>
        )}
      </div>

      {/* Pagination and Item Count */}
      <div className="table-footer">
        {/* Item Count (Action #27) */}
        <div className="item-count">
          Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClients.length)} из {filteredClients.length} клиентов
        </div>

        {/* Pagination (Action #28) */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Назад
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Вперед →
            </button>
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  )
}

export default BankEmployee 