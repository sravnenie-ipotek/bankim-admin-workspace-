import React, { useState } from 'react';
import './DropdownEditor.css';

interface DropdownOption {
  value: string;
  text: {
    en: string;
    he: string;
    ru: string;
  };
}

interface DropdownData {
  label: {
    en: string;
    he: string;
    ru: string;
  };
  placeholder: {
    en: string;
    he: string;
    ru: string;
  };
  options: DropdownOption[];
}

interface DropdownEditorProps {
  dropdownKey: string;
  initialData?: DropdownData;
  onSave: (data: DropdownData) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

type Language = 'en' | 'he' | 'ru';

const LANGUAGES: { code: Language; name: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'ru', name: 'Русский', dir: 'ltr' }
];

const DropdownEditor: React.FC<DropdownEditorProps> = ({
  dropdownKey,
  initialData,
  onSave,
  onCancel,
  isNew = false
}) => {
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [data, setData] = useState<DropdownData>(
    initialData || {
      label: { en: '', he: '', ru: '' },
      placeholder: { en: '', he: '', ru: '' },
      options: []
    }
  );

  // Get current language direction
  const currentDir = LANGUAGES.find(l => l.code === activeLanguage)?.dir || 'ltr';

  // Update label for current language
  const updateLabel = (value: string) => {
    setData(prev => ({
      ...prev,
      label: {
        ...prev.label,
        [activeLanguage]: value
      }
    }));
  };

  // Update placeholder for current language
  const updatePlaceholder = (value: string) => {
    setData(prev => ({
      ...prev,
      placeholder: {
        ...prev.placeholder,
        [activeLanguage]: value
      }
    }));
  };

  // Add new option
  const addOption = () => {
    const newOption: DropdownOption = {
      value: `option_${data.options.length + 1}`,
      text: { en: '', he: '', ru: '' }
    };
    
    setData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  // Update option value
  const updateOptionValue = (index: number, value: string) => {
    setData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, value } : opt
      )
    }));
  };

  // Update option text for current language
  const updateOptionText = (index: number, text: string) => {
    setData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index 
          ? { 
              ...opt, 
              text: { ...opt.text, [activeLanguage]: text }
            }
          : opt
      )
    }));
  };

  // Remove option
  const removeOption = (index: number) => {
    setData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // Move option up
  const moveOptionUp = (index: number) => {
    if (index === 0) return;
    
    setData(prev => {
      const newOptions = [...prev.options];
      [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
      return { ...prev, options: newOptions };
    });
  };

  // Move option down
  const moveOptionDown = (index: number) => {
    if (index === data.options.length - 1) return;
    
    setData(prev => {
      const newOptions = [...prev.options];
      [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
      return { ...prev, options: newOptions };
    });
  };

  // Validate data before saving
  const validateData = (): boolean => {
    const validationErrors: string[] = [];
    
    // Check labels
    if (!data.label.en) validationErrors.push('English label is required');
    if (!data.label.he) validationErrors.push('Hebrew label is required');
    if (!data.label.ru) validationErrors.push('Russian label is required');
    
    // Check placeholders (optional but if one exists, all should exist)
    const hasAnyPlaceholder = data.placeholder.en || data.placeholder.he || data.placeholder.ru;
    if (hasAnyPlaceholder) {
      if (!data.placeholder.en) validationErrors.push('English placeholder is required');
      if (!data.placeholder.he) validationErrors.push('Hebrew placeholder is required');
      if (!data.placeholder.ru) validationErrors.push('Russian placeholder is required');
    }
    
    // Check options
    if (data.options.length === 0) {
      validationErrors.push('At least one option is required');
    } else {
      data.options.forEach((option, index) => {
        if (!option.value) {
          validationErrors.push(`Option ${index + 1}: value is required`);
        }
        if (!option.text.en) {
          validationErrors.push(`Option ${index + 1}: English text is required`);
        }
        if (!option.text.he) {
          validationErrors.push(`Option ${index + 1}: Hebrew text is required`);
        }
        if (!option.text.ru) {
          validationErrors.push(`Option ${index + 1}: Russian text is required`);
        }
      });
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateData()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error saving dropdown:', error);
      setErrors(['Failed to save dropdown. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let total = 0;
    let completed = 0;
    
    // Labels (3 languages)
    total += 3;
    if (data.label.en) completed++;
    if (data.label.he) completed++;
    if (data.label.ru) completed++;
    
    // Placeholders (3 languages) - optional
    if (data.placeholder.en || data.placeholder.he || data.placeholder.ru) {
      total += 3;
      if (data.placeholder.en) completed++;
      if (data.placeholder.he) completed++;
      if (data.placeholder.ru) completed++;
    }
    
    // Options
    data.options.forEach(option => {
      total += 4; // value + 3 languages
      if (option.value) completed++;
      if (option.text.en) completed++;
      if (option.text.he) completed++;
      if (option.text.ru) completed++;
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const completion = calculateCompletion();

  return (
    <div className="dropdown-editor">
      <div className="dropdown-editor-header">
        <h2>{isNew ? 'Create New Dropdown' : `Edit Dropdown: ${dropdownKey}`}</h2>
        <div className="completion-indicator">
          <span>Completion: {completion}%</span>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-messages">
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="language-tabs">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`language-tab ${activeLanguage === lang.code ? 'active' : ''}`}
            onClick={() => setActiveLanguage(lang.code)}
          >
            {lang.name}
            {!data.label[lang.code] && <span className="incomplete-indicator">!</span>}
          </button>
        ))}
      </div>

      <div className="editor-content" dir={currentDir}>
        <div className="form-section">
          <h3>Label</h3>
          <input
            type="text"
            className="form-input"
            value={data.label[activeLanguage]}
            onChange={(e) => updateLabel(e.target.value)}
            placeholder={`Enter ${LANGUAGES.find(l => l.code === activeLanguage)?.name} label`}
            dir={currentDir}
          />
        </div>

        <div className="form-section">
          <h3>Placeholder (Optional)</h3>
          <input
            type="text"
            className="form-input"
            value={data.placeholder[activeLanguage]}
            onChange={(e) => updatePlaceholder(e.target.value)}
            placeholder={`Enter ${LANGUAGES.find(l => l.code === activeLanguage)?.name} placeholder`}
            dir={currentDir}
          />
        </div>

        <div className="form-section">
          <h3>Options</h3>
          <div className="options-list">
            {data.options.map((option, index) => (
              <div key={index} className="option-item">
                <div className="option-controls">
                  <button
                    className="btn-icon"
                    onClick={() => moveOptionUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => moveOptionDown(index)}
                    disabled={index === data.options.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <span className="option-number">#{index + 1}</span>
                </div>
                
                <div className="option-fields">
                  <input
                    type="text"
                    className="option-value"
                    value={option.value}
                    onChange={(e) => updateOptionValue(index, e.target.value)}
                    placeholder="Option value (internal)"
                  />
                  <input
                    type="text"
                    className="option-text"
                    value={option.text[activeLanguage]}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    placeholder={`Display text (${activeLanguage})`}
                    dir={currentDir}
                  />
                  <button
                    className="btn-remove"
                    onClick={() => removeOption(index)}
                    title="Remove option"
                  >
                    ×
                  </button>
                </div>
                
                <div className="option-language-status">
                  {LANGUAGES.map(lang => (
                    <span
                      key={lang.code}
                      className={`lang-status ${option.text[lang.code] ? 'complete' : 'incomplete'}`}
                      title={`${lang.name}: ${option.text[lang.code] ? 'Complete' : 'Missing'}`}
                    >
                      {lang.code.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn-add-option" onClick={addOption}>
            + Add Option
          </button>
        </div>
      </div>

      <div className="editor-actions">
        <button
          className="btn-cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={isSaving || completion < 100}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default DropdownEditor;