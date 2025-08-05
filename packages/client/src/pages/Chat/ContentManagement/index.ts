/**
 * ContentManagement Module Index
 * Central export file for Chat Content Management components
 * 
 * Purpose:
 * - Provides clean imports for ContentManagement components
 * - Follows existing component export patterns in the codebase
 * - Ensures proper TypeScript module resolution
 * 
 * Security Note:
 * - Only exports components, no internal utilities exposed
 * - Maintains encapsulation of implementation details
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

// Main ContentManagement component export
export { default as ContentManagement } from './ContentManagement';

// Export TypeScript interfaces for external use
export type { 
  ContentPage, 
  ContentFilter, 
  ContentManagementProps 
} from './types/contentTypes';

// Component exports 
export { ContentTable } from './components/ContentTable';
// export { ContentFilters } from './components/ContentFilters'; // TODO: Phase 2
// export { ContentActions } from './components/ContentActions'; // TODO: Phase 2 