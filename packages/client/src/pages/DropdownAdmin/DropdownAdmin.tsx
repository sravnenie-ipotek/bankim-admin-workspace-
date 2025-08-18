import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Commented out unused import
import { apiService } from '../../services/api';
import DropdownEditor from '../../components/DropdownEditor';
import './DropdownAdmin.css';

interface DropdownConfig {
  dropdown_key: string;
  screen_location: string;
  field_name: string;
  dropdown_data: any;
  is_active: boolean;
  updated_at: string;
  updated_by?: string;
}

interface ScreenInfo {
  screen: string;
  dropdownCount: number;
}

type Language = 'en' | 'he' | 'ru';

const LANGUAGES = [
  { code: 'en' as Language, name: 'English' },
  { code: 'he' as Language, name: 'עברית' },
  { code: 'ru' as Language, name: 'Русский' }
];

const DropdownAdmin: React.FC = () => {
  // const navigate = useNavigate(); // Commented out unused variable
  
  // State management
  const [screens, setScreens] = useState<ScreenInfo[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [dropdowns, setDropdowns] = useState<any[]>([]);
  const [selectedDropdown, setSelectedDropdown] = useState<DropdownConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJsonbBadge, setShowJsonbBadge] = useState(true);

  // Load available screens on mount
  useEffect(() => {
    loadScreens();
  }, []);

  // Load dropdowns when screen or language changes
  useEffect(() => {
    if (selectedScreen) {
      loadDropdowns();
    }
  }, [selectedScreen, selectedLanguage]);

  // Load available screens
  const loadScreens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDropdownScreens();
      
      if (response.success && response.data) {
        setScreens(response.data);
        
        // Auto-select first screen if available
        if (response.data.length > 0 && !selectedScreen) {
          setSelectedScreen(response.data[0].screen);
        }
      } else {
        setError('Failed to load dropdown screens');
      }
    } catch (err) {
      console.error('Error loading screens:', err);
      setError('Failed to load dropdown screens');
    } finally {
      setLoading(false);
    }
  };

  // Load dropdowns for selected screen
  const loadDropdowns = async () => {
    if (!selectedScreen) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getScreenDropdowns(selectedScreen, selectedLanguage);
      
      if (response.success && response.data) {
        setDropdowns(response.data);
        // Check if it's JSONB source (type assertion for dynamic property)
        if ((response as any).jsonb_source) {
          setShowJsonbBadge(true);
        }
      } else {
        setError('Failed to load dropdowns');
        setDropdowns([]);
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err);
      setError('Failed to load dropdowns');
      setDropdowns([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown selection for editing
  const handleEditDropdown = async (dropdownKey: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDropdownByKey(dropdownKey);
      
      if (response.success && response.data) {
        setSelectedDropdown(response.data);
        setIsEditing(true);
      } else {
        setError('Failed to load dropdown details');
      }
    } catch (err) {
      console.error('Error loading dropdown:', err);
      setError('Failed to load dropdown details');
    } finally {
      setLoading(false);
    }
  };

  // Handle save from editor
  const handleSaveDropdown = async (dropdownData: any) => {
    if (!selectedDropdown) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateDropdown(
        selectedDropdown.dropdown_key,
        dropdownData
      );
      
      if (response.success) {
        setSuccessMessage('Dropdown updated successfully');
        setIsEditing(false);
        setSelectedDropdown(null);
        // Reload dropdowns to show updated data
        await loadDropdowns();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to save dropdown');
      }
    } catch (err) {
      console.error('Error saving dropdown:', err);
      setError('Failed to save dropdown');
    } finally {
      setLoading(false);
    }
  };

  // Handle create new dropdown
  const handleCreateDropdown = async (dropdownData: any) => {
    if (!selectedScreen || !newFieldName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createDropdown(
        selectedScreen,
        newFieldName,
        dropdownData
      );
      
      if (response.success) {
        setSuccessMessage('Dropdown created successfully');
        setIsCreating(false);
        setNewFieldName('');
        // Reload dropdowns to show new item
        await loadDropdowns();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to create dropdown');
      }
    } catch (err) {
      console.error('Error creating dropdown:', err);
      setError('Failed to create dropdown');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete dropdown
  const handleDeleteDropdown = async (dropdownKey: string) => {
    if (!confirm(`Are you sure you want to delete dropdown: ${dropdownKey}?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.deleteDropdown(dropdownKey);
      
      if (response.success) {
        setSuccessMessage('Dropdown deleted successfully');
        // Reload dropdowns to remove deleted item
        await loadDropdowns();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to delete dropdown');
      }
    } catch (err) {
      console.error('Error deleting dropdown:', err);
      setError('Failed to delete dropdown');
    } finally {
      setLoading(false);
    }
  };

  // Filter dropdowns based on search term
  const filteredDropdowns = dropdowns.filter(dropdown => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      dropdown.key?.toLowerCase().includes(searchLower) ||
      dropdown.field?.toLowerCase().includes(searchLower) ||
      dropdown.label?.toLowerCase().includes(searchLower)
    );
  });

  // State for new dropdown creation
  const [newFieldName, setNewFieldName] = useState('');

  // Render editor if editing or creating
  if (isEditing && selectedDropdown) {
    return (
      <div className="dropdown-admin-container">
        <DropdownEditor
          dropdownKey={selectedDropdown.dropdown_key}
          initialData={selectedDropdown.dropdown_data}
          onSave={handleSaveDropdown}
          onCancel={() => {
            setIsEditing(false);
            setSelectedDropdown(null);
          }}
          isNew={false}
        />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="dropdown-admin-container">
        <div className="create-dropdown-form">
          <h3>Create New Dropdown</h3>
          <div className="form-group">
            <label>Screen Location:</label>
            <input type="text" value={selectedScreen} disabled />
          </div>
          <div className="form-group">
            <label>Field Name:</label>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Enter field name (e.g., property_type)"
            />
          </div>
          {newFieldName && (
            <div className="form-group">
              <label>Dropdown Key (auto-generated):</label>
              <input
                type="text"
                value={`${selectedScreen}_${newFieldName}`}
                disabled
              />
            </div>
          )}
          {newFieldName && (
            <DropdownEditor
              dropdownKey={`${selectedScreen}_${newFieldName}`}
              onSave={handleCreateDropdown}
              onCancel={() => {
                setIsCreating(false);
                setNewFieldName('');
              }}
              isNew={true}
            />
          )}
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="dropdown-admin-container">
      <div className="dropdown-admin-header">
        <h1>
          Dropdown Management
          {showJsonbBadge && (
            <span className="jsonb-badge" title="Using JSONB system">
              JSONB ✓
            </span>
          )}
        </h1>
        <p className="subtitle">Manage multilingual dropdown configurations using the new JSONB system</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      <div className="dropdown-controls">
        <div className="screen-selector">
          <label>Select Screen:</label>
          <select
            value={selectedScreen}
            onChange={(e) => setSelectedScreen(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select Screen --</option>
            {screens.map(screen => (
              <option key={screen.screen} value={screen.screen}>
                {screen.screen} ({screen.dropdownCount} dropdowns)
              </option>
            ))}
          </select>
        </div>

        <div className="language-selector">
          <label>Display Language:</label>
          <div className="language-buttons">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
                onClick={() => setSelectedLanguage(lang.code)}
                disabled={loading}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search dropdowns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn-create"
          onClick={() => setIsCreating(true)}
          disabled={!selectedScreen || loading}
        >
          + Create New Dropdown
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {!loading && selectedScreen && (
        <div className="dropdown-list">
          <h3>
            Dropdowns for {selectedScreen} 
            <span className="count">({filteredDropdowns.length} items)</span>
          </h3>
          
          {filteredDropdowns.length === 0 ? (
            <div className="no-dropdowns">
              <p>No dropdowns found for this screen.</p>
              <button
                className="btn-create-first"
                onClick={() => setIsCreating(true)}
              >
                Create First Dropdown
              </button>
            </div>
          ) : (
            <div className="dropdown-grid">
              {filteredDropdowns.map((dropdown) => (
                <div key={dropdown.key} className="dropdown-card">
                  <div className="dropdown-card-header">
                    <h4>{dropdown.field}</h4>
                    <span className="dropdown-key">{dropdown.key}</span>
                  </div>
                  
                  <div className="dropdown-card-body">
                    <div className="dropdown-info">
                      <label>Label:</label>
                      <span>{dropdown.label || 'No label'}</span>
                    </div>
                    
                    <div className="dropdown-info">
                      <label>Placeholder:</label>
                      <span>{dropdown.placeholder || 'No placeholder'}</span>
                    </div>
                    
                    <div className="dropdown-info">
                      <label>Options:</label>
                      <span>{dropdown.options?.length || 0} items</span>
                    </div>
                    
                    {dropdown.options && dropdown.options.length > 0 && (
                      <div className="dropdown-preview">
                        <select className="preview-select">
                          <option>{dropdown.placeholder || 'Select...'}</option>
                          {dropdown.options.slice(0, 3).map((opt: any, idx: number) => (
                            <option key={idx} value={opt.value}>
                              {opt.text}
                            </option>
                          ))}
                          {dropdown.options.length > 3 && (
                            <option disabled>... and {dropdown.options.length - 3} more</option>
                          )}
                        </select>
                      </div>
                    )}
                    
                    {dropdown.lastUpdated && (
                      <div className="dropdown-meta">
                        <small>
                          Updated: {new Date(dropdown.lastUpdated).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>
                  
                  <div className="dropdown-card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditDropdown(dropdown.key)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteDropdown(dropdown.key)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !selectedScreen && (
        <div className="select-screen-prompt">
          <p>Please select a screen from the dropdown above to view and manage dropdowns.</p>
        </div>
      )}
    </div>
  );
};

export default DropdownAdmin;