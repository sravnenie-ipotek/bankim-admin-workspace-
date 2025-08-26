/**
 * JSONBDropdownEdit Export
 * 
 * This file exports the appropriate version based on testing mode
 */

import JSONBDropdownEditOriginal from './JSONBDropdownEdit';
import JSONBDropdownEditV2 from './JSONBDropdownEditV2';

// Check if shadow testing is enabled
const isShadowTestingEnabled = () => {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage for testing flag
  const testingEnabled = localStorage.getItem('jsonb_shadow_testing') === 'true';
  
  // Check URL parameter for testing
  const urlParams = new URLSearchParams(window.location.search);
  const urlTestingEnabled = urlParams.get('shadow_test') === 'true';
  
  return testingEnabled || urlTestingEnabled;
};

// Export the appropriate version
const JSONBDropdownEdit = isShadowTestingEnabled() 
  ? JSONBDropdownEditV2 
  : JSONBDropdownEditOriginal;

// Log which version is being used
if (typeof window !== 'undefined') {
  if (isShadowTestingEnabled()) {
    console.log('🧪 [JSONB] Using V2 component with shadow testing enabled');
  } else {
    console.log('📝 [JSONB] Using original component');
  }
}

// Export helper to toggle testing
export function enableShadowTesting(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jsonb_shadow_testing', 'true');
    console.log('✅ Shadow testing enabled. Reload page to activate V2 component.');
  }
}

export function disableShadowTesting(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jsonb_shadow_testing');
    console.log('❌ Shadow testing disabled. Reload page to use original component.');
  }
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).enableJSONBShadowTesting = enableShadowTesting;
  (window as any).disableJSONBShadowTesting = disableShadowTesting;
}

export default JSONBDropdownEdit;
export { JSONBDropdownEditOriginal, JSONBDropdownEditV2 };