/**
 * JSONB Migration Loader
 * 
 * This file loads all migration testing infrastructure
 * and makes it available in the browser console.
 * 
 * @important Automatically loads in development mode
 */

// Import all migration modules
import '../services/apiV2';
import migrationControl from './migration-control';
import { executeMigration, checkMigrationStatus } from '../tests/execute-migration';
import migrationTester from '../tests/jsonb-migration-test';

// ============================================
// AUTO-INITIALIZATION
// ============================================

class MigrationLoader {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize migration testing infrastructure
   */
  private initialize(): void {
    if (this.initialized) return;
    
    // Only load in development or when explicitly enabled
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestingEnabled = localStorage.getItem('jsonb_migration_testing') === 'true';
    
    if (isDevelopment || isTestingEnabled) {
      this.loadMigrationTools();
      this.initialized = true;
    }
  }

  /**
   * Load all migration tools into window
   */
  private loadMigrationTools(): void {
    if (typeof window === 'undefined') return;

    // Create global migration object
    const migration = {
      // Quick actions
      execute: async () => {
        console.log('Starting migration execution...');
        return await executeMigration();
      },
      
      test: async () => {
        console.log('Running migration tests...');
        return await migrationTester.runAllTests();
      },
      
      status: () => {
        return checkMigrationStatus();
      },
      
      // Control functions
      control: {
        enableTest: () => migrationControl.setMode('TEST' as any),
        enableParallel: () => {
          console.warn('⚠️  This will write to database. Confirm with migration.control.confirmParallel()');
        },
        confirmParallel: () => migrationControl.setMode('PARALLEL' as any),
        enableProduction: () => {
          console.warn('⚠️  This will use new API only. Confirm with migration.control.confirmProduction()');
        },
        confirmProduction: () => migrationControl.setMode('PRODUCTION' as any),
      },
      
      // Information
      help: () => {
        console.log('');
        console.log('📚 JSONB Migration Commands:');
        console.log('════════════════════════════');
        console.log('');
        console.log('🚀 Quick Commands:');
        console.log('  migration.execute()  - Run complete migration process');
        console.log('  migration.test()     - Run tests only');
        console.log('  migration.status()   - Check current status');
        console.log('');
        console.log('🎛️  Control Commands:');
        console.log('  migration.control.enableTest()       - Safe test mode');
        console.log('  migration.control.enableParallel()   - Dual write mode');
        console.log('  migration.control.enableProduction() - New API only');
        console.log('');
        console.log('📊 Current Status:');
        console.log('  Mode: ' + migrationControl.getMode());
        console.log('  Test Mode: ' + (migrationControl.isTestMode() ? 'YES ✅' : 'NO ❌'));
        console.log('  Production Blocked: ' + (migrationControl.isProductionBlocked() ? 'YES ✅' : 'NO ❌'));
        console.log('');
      }
    };

    // Attach to window
    (window as any).migration = migration;

    // Show initialization message
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║          JSONB MIGRATION TESTING LOADED                  ║');
    console.log('║                Type: migration.help()                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Auto-show status
    console.log('Current Migration Status:');
    console.log('─────────────────────────');
    console.log('Mode:', migrationControl.getMode());
    console.log('Database Writes:', migrationControl.isTestMode() ? 'BLOCKED ✅' : 'ALLOWED ⚠️');
    console.log('');
    console.log('🚀 Quick Start: Run migration.execute() to begin');
    console.log('');
  }

  /**
   * Enable migration testing
   */
  public enableTesting(): void {
    localStorage.setItem('jsonb_migration_testing', 'true');
    this.initialize();
    console.log('✅ Migration testing enabled. Reload page to activate.');
  }

  /**
   * Disable migration testing
   */
  public disableTesting(): void {
    localStorage.removeItem('jsonb_migration_testing');
    console.log('❌ Migration testing disabled. Reload page to deactivate.');
  }
}

// Create singleton instance
const migrationLoader = new MigrationLoader();

// Export for use
export default migrationLoader;