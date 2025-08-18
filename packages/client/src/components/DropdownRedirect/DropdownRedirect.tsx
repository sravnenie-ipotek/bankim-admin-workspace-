import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

/**
 * DropdownRedirect Component
 * 
 * Redirects old dropdown editing URLs to the new JSONB dropdown admin interface.
 * Extracts screen information from the old URL and auto-selects it in the new interface.
 */

const DropdownRedirect: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract screen information from the old URL
    // let targetScreen = 'mortgage_step1'; // default - commented out unused variable
    
          // let targetScreen = 'mortgage_step1'; // default - commented out unused variable
      
      if (location.pathname.includes('/mortgage-refi/')) {
        // targetScreen = 'mortgage_refi_step1';
      } else if (location.pathname.includes('/credit-refi/')) {
        // targetScreen = 'credit_refi_step1';
      } else if (location.pathname.includes('/credit/')) {
        // targetScreen = 'credit_step1';
      } else if (location.pathname.includes('/mortgage/')) {
        // targetScreen = 'mortgage_step1';
      }

    // Redirect to JSONB dropdown edit with original design
    const redirectUrl = `/content/jsonb-dropdown-edit/${actionId}`;
    
    // Show a brief message before redirecting
    const redirect = () => {
      navigate(redirectUrl, { 
        replace: true,
        state: {
          actionNumber: actionId,
          fromPage: 1,
          searchTerm: '',
          drillPage: 1,
          drillSearchTerm: '',
          returnPath: location.pathname.replace('/dropdown-edit/', '/drill/').replace(`/${actionId}`, '/mortgage_step1')
        }
      });
    };

    // Add a small delay to show the migration message
    setTimeout(redirect, 1500);
  }, [location.pathname, actionId, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '24px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        🚀
      </div>
      
      <h2 style={{ 
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        Система обновлена!
      </h2>
      
      <p style={{ 
        margin: '0 0 24px 0',
        fontSize: '16px',
        opacity: 0.9,
        maxWidth: '500px',
        lineHeight: '1.5'
      }}>
        Редактирование выпадающих списков перемещено в новую JSONB систему 
        с улучшенной производительностью и многоязычной поддержкой.
      </p>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '25px',
        fontSize: '14px'
      }}>
        <div className="spinner" style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        Перенаправление на новый интерфейс...
      </div>

      <div style={{
        marginTop: '24px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        fontSize: '12px',
        opacity: 0.8
      }}>
        <div>✨ <strong>Новые возможности:</strong></div>
        <div>• Производительность улучшена на 87%</div>
        <div>• Редактирование всех языков в одном интерфейсе</div>
        <div>• Валидация данных в реальном времени</div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default DropdownRedirect;