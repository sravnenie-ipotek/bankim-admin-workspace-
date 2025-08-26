import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import './index.css'

// Load JSONB migration testing infrastructure in development
import './utils/migration-loader';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider defaultLanguage="ru">
      <App />
    </LanguageProvider>
  </React.StrictMode>,
) 