/**
 * API V2 Service - JSONB Migration Shadow Testing
 * 
 * This is a SHADOW implementation for testing the new JSONB unified API
 * without affecting production. It runs in parallel with existing API.
 * 
 * @version 2.0.0 - BankIM JSONB Migration
 * @created 2025-08-26
 */

import { ApiResponse } from '@bankim/shared';

// ============================================
// CONFIGURATION - TEST MODE CONTROL
// ============================================

interface TestModeConfig {
  enabled: boolean;
  dryRun: boolean;
  logOnly: boolean;
  validateOnly: boolean;
  bankimApiUrl: string;
  useRealEndpoint: boolean;
}

// SHADOW TEST CONFIGURATION
const TEST_CONFIG: TestModeConfig = {
  enabled: true,                    // Enable shadow testing
  dryRun: true,                     // Don't make actual API calls
  logOnly: true,                    // Only log, don't execute
  validateOnly: true,               // Only validate data structure
  bankimApiUrl: 'http://banking-app:8003', // BankIM's server
  useRealEndpoint: false            // Use mock endpoint for testing
};

// ============================================
// JSONB DATA STRUCTURES - Per BankIM Spec
// ============================================

interface JSONBLabel {
  en: string;
  he: string;
  ru: string;
}

interface JSONBOption {
  value: string;
  label: JSONBLabel;
  metadata?: {
    ltv_ratio?: number;
    display_order?: number;
    [key: string]: any;
  };
}

interface JSONBValidation {
  required?: boolean;
  affects_ltv?: boolean;
  min_selections?: number;
  max_selections?: number;
  [key: string]: any;
}

interface JSONBDropdownData {
  field_name: string;
  field_type: 'dropdown' | 'menu' | 'text';
  label: JSONBLabel;
  placeholder?: JSONBLabel;
  options?: JSONBOption[];
  validation?: JSONBValidation;
  metadata?: Record<string, any>;
}

interface UnifiedContentRequest {
  key: string;
  screen_location: string;
  category: 'dropdown' | 'menu' | 'text';
  data: JSONBDropdownData;
}

interface UnifiedContentResponse {
  success: boolean;
  updated_at: string;
  cache_cleared: boolean;
  affected_users: string;
  test_mode?: boolean;
}

// ============================================
// DATA TRANSFORMATION UTILITIES
// ============================================

class DataTransformer {
  /**
   * Transform old format to new JSONB format per BankIM spec
   */
  static transformToJSONB(
    key: string,
    oldData: any,
    contentType: 'dropdown' | 'menu' | 'text' = 'dropdown'
  ): JSONBDropdownData {
    
    // Log transformation for debugging
    console.log('🔄 [SHADOW] Transforming old data to JSONB:', {
      key,
      contentType,
      oldDataStructure: Object.keys(oldData || {})
    });

    // Handle different input formats
    let label: JSONBLabel;
    let options: JSONBOption[] = [];
    
    // Extract label from various possible structures
    if (oldData.label && typeof oldData.label === 'object') {
      label = {
        en: oldData.label.en || oldData.label.ru || '',
        he: oldData.label.he || '',
        ru: oldData.label.ru || ''
      };
    } else if (oldData.titleRu || oldData.titleHe) {
      label = {
        en: oldData.titleEn || oldData.titleRu || '',
        he: oldData.titleHe || '',
        ru: oldData.titleRu || ''
      };
    } else {
      label = {
        en: key,
        he: key,
        ru: key
      };
    }

    // Transform options based on old structure
    if (oldData.options && Array.isArray(oldData.options)) {
      options = oldData.options.map((opt: any, index: number) => {
        // Handle various option formats
        if (opt.label && typeof opt.label === 'object') {
          // New format already
          return {
            value: opt.value || `option_${index + 1}`,
            label: {
              en: opt.label.en || opt.label.ru || '',
              he: opt.label.he || '',
              ru: opt.label.ru || ''
            },
            metadata: {
              display_order: index + 1,
              ...opt.metadata
            }
          };
        } else if (opt.ru || opt.he) {
          // Old format with direct language fields
          return {
            value: opt.value || `option_${index + 1}`,
            label: {
              en: opt.en || opt.ru || '',
              he: opt.he || '',
              ru: opt.ru || ''
            },
            metadata: {
              display_order: index + 1
            }
          };
        } else if (opt.text) {
          // Legacy format with 'text' field
          return {
            value: opt.value || `option_${index + 1}`,
            label: {
              en: opt.text,
              he: opt.text,
              ru: opt.text
            },
            metadata: {
              display_order: index + 1
            }
          };
        } else {
          // Fallback for unknown format
          return {
            value: `option_${index + 1}`,
            label: {
              en: String(opt),
              he: String(opt),
              ru: String(opt)
            },
            metadata: {
              display_order: index + 1
            }
          };
        }
      });
    }

    // Build the JSONB structure
    const jsonbData: JSONBDropdownData = {
      field_name: key,
      field_type: contentType,
      label,
      placeholder: {
        en: 'Select option',
        he: 'בחר אפשרות',
        ru: 'Выберите вариант'
      },
      options: contentType === 'dropdown' ? options : undefined,
      validation: {
        required: true,
        affects_ltv: key.includes('property') || key.includes('ownership')
      }
    };

    console.log('✅ [SHADOW] Transformed to JSONB:', {
      field_name: jsonbData.field_name,
      field_type: jsonbData.field_type,
      optionCount: jsonbData.options?.length || 0
    });

    return jsonbData;
  }

  /**
   * Validate JSONB structure against BankIM requirements
   */
  static validateJSONB(data: JSONBDropdownData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.field_name) errors.push('field_name is required');
    if (!data.field_type) errors.push('field_type is required');
    if (!data.label) errors.push('label is required');

    // Label validation
    if (data.label) {
      if (!data.label.ru) errors.push('label.ru is required');
      if (!data.label.he) errors.push('label.he is required');
      if (!data.label.en) errors.push('label.en is required');
    }

    // Options validation for dropdowns
    if (data.field_type === 'dropdown') {
      if (!data.options || !Array.isArray(data.options)) {
        errors.push('options array is required for dropdowns');
      } else {
        data.options.forEach((opt, index) => {
          if (!opt.value) errors.push(`options[${index}].value is required`);
          if (!opt.label) errors.push(`options[${index}].label is required`);
          if (opt.label) {
            if (!opt.label.ru) errors.push(`options[${index}].label.ru is required`);
            if (!opt.label.he) errors.push(`options[${index}].label.he is required`);
            if (!opt.label.en) errors.push(`options[${index}].label.en is required`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ============================================
// SHADOW API SERVICE CLASS
// ============================================

class ApiV2Service {
  private testMode: TestModeConfig;
  private testResults: Map<string, any> = new Map();

  constructor(config: TestModeConfig = TEST_CONFIG) {
    this.testMode = config;
    console.log('🚀 [SHADOW] ApiV2 Service initialized with config:', config);
  }

  /**
   * Shadow test for updating content via new unified endpoint
   */
  async updateContent(
    key: string,
    screenLocation: string,
    contentData: any,
    category: 'dropdown' | 'menu' | 'text' = 'dropdown'
  ): Promise<ApiResponse<UnifiedContentResponse>> {
    
    console.log('═══════════════════════════════════════════');
    console.log('🧪 [SHADOW TEST] Starting update operation');
    console.log('═══════════════════════════════════════════');
    console.log('📋 Input:', { key, screenLocation, category });

    try {
      // Step 1: Transform data to new JSONB format
      const jsonbData = DataTransformer.transformToJSONB(key, contentData, category);
      
      // Step 2: Validate transformed data
      const validation = DataTransformer.validateJSONB(jsonbData);
      
      if (!validation.valid) {
        console.error('❌ [SHADOW] Validation failed:', validation.errors);
        
        if (this.testMode.validateOnly) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }
      } else {
        console.log('✅ [SHADOW] Validation passed');
      }

      // Step 3: Prepare request payload
      const requestPayload: UnifiedContentRequest = {
        key,
        screen_location: screenLocation,
        category,
        data: jsonbData
      };

      console.log('📤 [SHADOW] Request payload:', JSON.stringify(requestPayload, null, 2));

      // Step 4: Mock or real API call based on configuration
      let response: UnifiedContentResponse;
      
      if (this.testMode.dryRun) {
        // DRY RUN - Simulate success without actual API call
        console.log('🏃 [SHADOW] DRY RUN MODE - Simulating API response');
        
        response = {
          success: true,
          updated_at: new Date().toISOString(),
          cache_cleared: true,
          affected_users: 'all',
          test_mode: true
        };

        // Store test result for verification
        this.testResults.set(key, {
          timestamp: new Date().toISOString(),
          request: requestPayload,
          response: response,
          validation: validation
        });

      } else if (this.testMode.useRealEndpoint) {
        // REAL API CALL (when ready)
        console.log('🌐 [SHADOW] Making real API call to:', `${this.testMode.bankimApiUrl}/api/v2/content/unified`);
        
        const apiResponse = await fetch(`${this.testMode.bankimApiUrl}/api/v2/content/unified`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shadow-Test': 'true' // Indicate this is a test
          },
          body: JSON.stringify(requestPayload)
        });

        response = await apiResponse.json();
        
      } else {
        // MOCK ENDPOINT for testing
        console.log('🎭 [SHADOW] Using mock endpoint for testing');
        
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        response = {
          success: true,
          updated_at: new Date().toISOString(),
          cache_cleared: true,
          affected_users: 'all',
          test_mode: true
        };
      }

      console.log('📥 [SHADOW] Response:', response);
      console.log('═══════════════════════════════════════════');
      console.log('✅ [SHADOW TEST] Operation completed successfully');
      console.log('═══════════════════════════════════════════');

      return {
        success: true,
        data: response
      };

    } catch (error) {
      console.error('❌ [SHADOW] Error during test:', error);
      console.log('═══════════════════════════════════════════');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Shadow test failed'
      };
    }
  }

  /**
   * Get test results for verification
   */
  getTestResults(key?: string): any {
    if (key) {
      return this.testResults.get(key);
    }
    return Array.from(this.testResults.entries()).map(([k, v]) => ({ key: k, ...v }));
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults.clear();
    console.log('🧹 [SHADOW] Test results cleared');
  }

  /**
   * Toggle test mode settings
   */
  setTestMode(config: Partial<TestModeConfig>): void {
    this.testMode = { ...this.testMode, ...config };
    console.log('⚙️ [SHADOW] Test mode updated:', this.testMode);
  }

  /**
   * Get current test mode configuration
   */
  getTestMode(): TestModeConfig {
    return { ...this.testMode };
  }
}

// ============================================
// EXPORT SHADOW API SERVICE
// ============================================

// Create singleton instance
const apiV2Service = new ApiV2Service();

// Export for use in components
export { apiV2Service, DataTransformer, type JSONBDropdownData, type UnifiedContentRequest };
export default apiV2Service;