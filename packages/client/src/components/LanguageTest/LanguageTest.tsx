import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageTest: React.FC = () => {
  const { language, t, translations } = useLanguage();

  useEffect(() => {
    console.log('=== Language Test Component Mounted ===');
    console.log('Current language:', language);
    console.log('Translations loaded:', Object.keys(translations).length > 0);
    console.log('Sample translation (common.save):', t('common.save'));
    console.log('Sample translation (auth.login):', t('auth.login'));
    console.log('Translations object:', translations);
  }, [language, translations, t]);

  return (
    <div style={{ background: '#1F2937', padding: '1rem', margin: '1rem', borderRadius: '8px' }}>
      <h3 style={{ color: '#F59E0B' }}>Language Test Component</h3>
      <p style={{ color: '#9CA3AF' }}>Check browser console for debug output</p>
      <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
        ⚠️ Use header dropdown to change language
      </p>
      <div style={{ marginTop: '1rem', color: '#D1D5DB' }}>
        <p>Current: {language}</p>
        <p>{t('common.save')} | {t('common.cancel')} | {t('common.delete')}</p>
      </div>
    </div>
  );
};

export default LanguageTest;