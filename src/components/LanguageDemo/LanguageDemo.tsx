import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageDemo.css';

const LanguageDemo: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="language-demo">
      <h2>{t('common.language')}: {language}</h2>
      <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
        Use header dropdown to change language
      </p>
      <div className="demo-buttons">
        <button className="demo-btn primary">{t('common.save')}</button>
        <button className="demo-btn">{t('common.cancel')}</button>
        <button className="demo-btn danger">{t('common.delete')}</button>
      </div>
      <div className="demo-info">
        <p>{t('auth.authRequiredMessage')}</p>
        <p>{t('roles.director')} | {t('roles.contentManager')}</p>
      </div>
    </div>
  );
};

export default LanguageDemo;