import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './QALanguage.css';

/**
 * QA Language Test Component
 * Tests the translation system functionality
 */
const QALanguage: React.FC = () => {
  const { language, t, isRTL, translations } = useLanguage();

  // Test translation keys
  const testKeys = [
    'common.loading',
    'auth.login',
    'roles.director',
    'menu.dashboard',
    'content.management',
    'messages.success.saved',
    'languages.ru',
    'languages.he',
    'languages.en'
  ];

  return (
    <div className="qa-language-container">
      <h1>🧪 Language System QA Test</h1>
      
      {/* Current Language Info */}
      <div className="qa-section">
        <h2>Current Language State</h2>
        <div className="qa-info-grid">
          <div className="qa-info-item">
            <strong>Active Language:</strong> {language}
          </div>
          <div className="qa-info-item">
            <strong>Direction:</strong> {isRTL ? 'RTL' : 'LTR'}
          </div>
          <div className="qa-info-item">
            <strong>Translations Loaded:</strong> {Object.keys(translations).length > 0 ? 'Yes' : 'No'}
          </div>
          <div className="qa-info-item">
            <strong>localStorage:</strong> {localStorage.getItem('preferredLanguage') || 'Not set'}
          </div>
        </div>
      </div>

      {/* Language Switcher Test - Removed, only use header dropdown */}
      <div className="qa-section">
        <h2>Language Switching</h2>
        <p>⚠️ Language can only be changed using the dropdown in the header navbar.</p>
        <p>Location: Header → Language Dropdown (top right)</p>
      </div>

      {/* Translation Tests */}
      <div className="qa-section">
        <h2>Translation Key Tests</h2>
        <table className="qa-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Translation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {testKeys.map(key => {
              const translation = t(key);
              const isTranslated = translation !== key;
              return (
                <tr key={key}>
                  <td><code>{key}</code></td>
                  <td>{translation}</td>
                  <td>
                    <span className={`qa-status ${isTranslated ? 'success' : 'error'}`}>
                      {isTranslated ? '✅ OK' : '❌ Missing'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Parameterized Translation Test */}
      <div className="qa-section">
        <h2>Parameterized Translation Test</h2>
        <div className="qa-test-item">
          <strong>Key:</strong> <code>forms.validation.minLength</code><br/>
          <strong>Params:</strong> {`{ min: 5 }`}<br/>
          <strong>Result:</strong> {t('forms.validation.minLength', { min: 5 })}
        </div>
      </div>

      {/* UI Component Translation Test */}
      <div className="qa-section">
        <h2>UI Component Examples</h2>
        <div className="qa-ui-examples">
          <button className="qa-example-btn">{t('common.save')}</button>
          <button className="qa-example-btn">{t('common.cancel')}</button>
          <button className="qa-example-btn danger">{t('common.delete')}</button>
          <input 
            type="text" 
            placeholder={t('forms.placeholder.search')}
            className="qa-example-input"
          />
        </div>
      </div>

      {/* Translation Coverage */}
      <div className="qa-section">
        <h2>Translation Coverage</h2>
        <div className="qa-coverage">
          {Object.keys(translations).map(category => (
            <div key={category} className="qa-coverage-item">
              <strong>{category}:</strong> {
                typeof translations[category] === 'object' 
                  ? Object.keys(translations[category]).length 
                  : 1
              } keys
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="qa-section">
        <h2>Debug Information</h2>
        <div className="qa-debug">
          <pre>{JSON.stringify({ language, isRTL }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default QALanguage;