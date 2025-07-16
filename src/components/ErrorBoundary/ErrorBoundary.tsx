import { Component, ErrorInfo, ReactNode } from 'react';
import ProductionErrorHandler from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our error handler
    ProductionErrorHandler.handleComponentError(error, 'ErrorBoundary');
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🚨 Что-то пошло не так</h2>
            <p>Произошла ошибка при загрузке этого компонента.</p>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
              <summary>Детали ошибки (для разработчиков)</summary>
              {this.state.error && this.state.error.toString()}
            </details>
            <button 
              onClick={() => this.setState({ hasError: false })}
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#6366F1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;