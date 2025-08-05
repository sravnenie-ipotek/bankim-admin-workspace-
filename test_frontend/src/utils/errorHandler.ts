/**
 * Production Error Handler
 * Handles errors gracefully in production environment
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

export class ProductionErrorHandler {
  static logError(error: Error | ErrorInfo, context?: string): void {
    // In production, log errors to console for debugging
    console.group(`🚨 Production Error ${context ? `- ${context}` : ''}`);
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }

  static handleApiError(error: Error, fallbackData?: any): any {
    this.logError(error, 'API Error');
    
    // Return fallback data or empty result
    return fallbackData || { success: false, error: error.message };
  }

  static handleComponentError(error: Error, componentName: string): void {
    this.logError(error, `Component Error - ${componentName}`);
    
    // Could integrate with error reporting service here
    // Example: Sentry, LogRocket, etc.
  }

  static isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('ERR_BLOCKED_BY_CLIENT');
  }

  static isProductionMode(): boolean {
    return import.meta.env.PROD;
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ProductionErrorHandler.logError(
      { message: event.reason?.message || 'Unhandled promise rejection' },
      'Unhandled Promise'
    );
  });
}

export default ProductionErrorHandler;