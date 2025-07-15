/**
 * API Service for BankIM Management Portal
 * Centralized API calls for all backend operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FormulaData {
  minTerm: string;
  maxTerm: string;
  financingPercentage: string;
  bankInterestRate: string;
  baseInterestRate: string;
  variableInterestRate: string;
  interestChangePeriod: string;
  inflationIndex: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Calculator Formula Operations
  async getCalculatorFormula(): Promise<ApiResponse<FormulaData>> {
    return this.request<FormulaData>('/api/calculator-formula');
  }

  async updateCalculatorFormula(formulaData: FormulaData): Promise<ApiResponse<FormulaData>> {
    return this.request<FormulaData>('/api/calculator-formula', {
      method: 'PUT',
      body: JSON.stringify(formulaData),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Database Info
  async getDbInfo(): Promise<ApiResponse<any>> {
    return this.request('/api/db-info');
  }

  // User Operations (existing)
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/users');
  }

  async getUserById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export type { FormulaData, ApiResponse }; 