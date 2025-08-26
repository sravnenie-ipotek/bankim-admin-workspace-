/**
 * JSONB Migration Control Center
 * 
 * Central control for switching between test and production modes
 * for the admin panel JSONB migration.
 * 
 * @important NO DATABASE MODIFICATIONS in test mode
 */

// ============================================
// MIGRATION CONFIGURATION
// ============================================

export enum MigrationMode {
  TEST = 'TEST',           // Shadow testing with no DB writes
  PARALLEL = 'PARALLEL',   // Write to both old and new systems
  PRODUCTION = 'PRODUCTION' // Full production mode with new API
}

export interface MigrationConfig {
  mode: MigrationMode;
  features: {
    shadowTesting: boolean;
    dryRun: boolean;
    blockProduction: boolean;
    logComparison: boolean;
    useNewAPI: boolean;
    useOldAPI: boolean;
  };
  endpoints: {
    oldAPI: string;
    newAPI: string;
  };
  validation: {
    enabled: boolean;
    strict: boolean;
  };
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

const CONFIG_PRESETS: Record<MigrationMode, MigrationConfig> = {
  [MigrationMode.TEST]: {
    mode: MigrationMode.TEST,
    features: {
      shadowTesting: true,
      dryRun: true,           // NO database writes
      blockProduction: true,   // Block production saves
      logComparison: true,
      useNewAPI: true,
      useOldAPI: false
    },
    endpoints: {
      oldAPI: '/api/admin/dropdown',
      newAPI: '/api/v2/content/unified'
    },
    validation: {
      enabled: true,
      strict: true
    }
  },

  [MigrationMode.PARALLEL]: {
    mode: MigrationMode.PARALLEL,
    features: {
      shadowTesting: true,
      dryRun: false,
      blockProduction: false,
      logComparison: true,
      useNewAPI: true,
      useOldAPI: true         // Write to BOTH systems
    },
    endpoints: {
      oldAPI: '/api/admin/dropdown',
      newAPI: '/api/v2/content/unified'
    },
    validation: {
      enabled: true,
      strict: false
    }
  },

  [MigrationMode.PRODUCTION]: {
    mode: MigrationMode.PRODUCTION,
    features: {
      shadowTesting: false,
      dryRun: false,
      blockProduction: false,
      logComparison: false,
      useNewAPI: true,
      useOldAPI: false       // Only use new API
    },
    endpoints: {
      oldAPI: '/api/admin/dropdown',
      newAPI: '/api/v2/content/unified'
    },
    validation: {
      enabled: true,
      strict: false
    }
  }
};

// ============================================
// MIGRATION CONTROL CLASS
// ============================================

class MigrationControl {
  private currentConfig: MigrationConfig;
  private originalConfig: MigrationConfig | null = null;
  private testResults: Map<string, any> = new Map();

  constructor() {
    // Start in TEST mode for safety
    this.currentConfig = { ...CONFIG_PRESETS[MigrationMode.TEST] };
    console.log('🛡️ Migration Control initialized in TEST mode (safe)');
  }

  /**
   * Get current configuration
   */
  getConfig(): MigrationConfig {
    return { ...this.currentConfig };
  }

  /**
   * Set migration mode
   */
  setMode(mode: MigrationMode): void {
    console.log(`🔄 Switching migration mode to: ${mode}`);
    
    // Store original config for rollback
    this.originalConfig = { ...this.currentConfig };
    
    // Apply new configuration
    this.currentConfig = { ...CONFIG_PRESETS[mode] };
    
    // Log the change
    this.logModeChange(mode);
  }

  /**
   * Get current mode
   */
  getMode(): MigrationMode {
    return this.currentConfig.mode;
  }

  /**
   * Check if in test mode
   */
  isTestMode(): boolean {
    return this.currentConfig.features.dryRun;
  }

  /**
   * Check if production saves are blocked
   */
  isProductionBlocked(): boolean {
    return this.currentConfig.features.blockProduction;
  }

  /**
   * Enable/disable specific features
   */
  setFeature(feature: keyof MigrationConfig['features'], value: boolean): void {
    this.currentConfig.features[feature] = value;
    console.log(`⚙️  Feature '${feature}' set to: ${value}`);
  }

  /**
   * Rollback to previous configuration
   */
  rollback(): void {
    if (this.originalConfig) {
      console.log('↩️  Rolling back to previous configuration');
      this.currentConfig = { ...this.originalConfig };
      this.originalConfig = null;
    } else {
      console.log('⚠️  No previous configuration to rollback to');
    }
  }

  /**
   * Store test results
   */
  recordTestResult(key: string, result: any): void {
    this.testResults.set(key, {
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get test results
   */
  getTestResults(): Map<string, any> {
    return new Map(this.testResults);
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults.clear();
    console.log('🧹 Test results cleared');
  }

  /**
   * Validate readiness for production
   */
  validateProductionReadiness(): {
    ready: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check test results
    if (this.testResults.size === 0) {
      issues.push('No test results found. Run tests first.');
    }

    // Check for test failures
    this.testResults.forEach((result, key) => {
      if (!result.success) {
        issues.push(`Test failed for: ${key}`);
      }
    });

    // Check current mode
    if (this.currentConfig.mode === MigrationMode.TEST) {
      warnings.push('Still in TEST mode. Switch to PARALLEL or PRODUCTION when ready.');
    }

    // Check feature flags
    if (this.currentConfig.features.dryRun) {
      warnings.push('Dry run is enabled. Database writes are blocked.');
    }

    if (this.currentConfig.features.blockProduction) {
      warnings.push('Production saves are blocked.');
    }

    return {
      ready: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Get status report
   */
  getStatusReport(): string {
    const report: string[] = [];
    
    report.push('╔═══════════════════════════════════════════════╗');
    report.push('║         MIGRATION STATUS REPORT              ║');
    report.push('╚═══════════════════════════════════════════════╝');
    report.push('');
    report.push(`Current Mode:     ${this.currentConfig.mode}`);
    report.push(`Shadow Testing:   ${this.currentConfig.features.shadowTesting ? '✅' : '❌'}`);
    report.push(`Dry Run:          ${this.currentConfig.features.dryRun ? '✅ (No DB writes)' : '❌'}`);
    report.push(`Block Production: ${this.currentConfig.features.blockProduction ? '✅' : '❌'}`);
    report.push(`Use Old API:      ${this.currentConfig.features.useOldAPI ? '✅' : '❌'}`);
    report.push(`Use New API:      ${this.currentConfig.features.useNewAPI ? '✅' : '❌'}`);
    report.push('');
    report.push(`Test Results:     ${this.testResults.size} recorded`);
    
    const validation = this.validateProductionReadiness();
    report.push(`Production Ready: ${validation.ready ? '✅' : '❌'}`);
    
    if (validation.issues.length > 0) {
      report.push('');
      report.push('Issues:');
      validation.issues.forEach(issue => {
        report.push(`  ❌ ${issue}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      report.push('');
      report.push('Warnings:');
      validation.warnings.forEach(warning => {
        report.push(`  ⚠️  ${warning}`);
      });
    }
    
    return report.join('\n');
  }

  /**
   * Log mode change
   */
  private logModeChange(mode: MigrationMode): void {
    const messages: Record<MigrationMode, string> = {
      [MigrationMode.TEST]: '🧪 TEST MODE: Shadow testing enabled, no database writes',
      [MigrationMode.PARALLEL]: '🔄 PARALLEL MODE: Writing to both old and new systems',
      [MigrationMode.PRODUCTION]: '🚀 PRODUCTION MODE: Using new JSONB API only'
    };

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(messages[mode]);
    console.log('═══════════════════════════════════════════');
    console.log('');
  }
}

// ============================================
// QUICK ACCESS FUNCTIONS
// ============================================

const migrationControl = new MigrationControl();

/**
 * Quick function to enable test mode
 */
export function enableTestMode(): void {
  migrationControl.setMode(MigrationMode.TEST);
}

/**
 * Quick function to enable parallel mode
 */
export function enableParallelMode(): void {
  console.warn('⚠️  PARALLEL MODE: Will write to database!');
  console.warn('⚠️  Confirm you want to proceed by calling confirmParallelMode()');
}

/**
 * Confirm parallel mode
 */
export function confirmParallelMode(): void {
  migrationControl.setMode(MigrationMode.PARALLEL);
}

/**
 * Quick function to enable production mode
 */
export function enableProductionMode(): void {
  console.warn('⚠️  PRODUCTION MODE: Will use new API only!');
  console.warn('⚠️  Confirm you want to proceed by calling confirmProductionMode()');
}

/**
 * Confirm production mode
 */
export function confirmProductionMode(): void {
  const validation = migrationControl.validateProductionReadiness();
  
  if (!validation.ready) {
    console.error('❌ Not ready for production:');
    validation.issues.forEach(issue => console.error(`   - ${issue}`));
    return;
  }
  
  migrationControl.setMode(MigrationMode.PRODUCTION);
}

/**
 * Get migration status
 */
export function getMigrationStatus(): void {
  console.log(migrationControl.getStatusReport());
}

// ============================================
// BROWSER CONSOLE HELPERS
// ============================================

if (typeof window !== 'undefined') {
  // Add to window for easy console access
  (window as any).migrationControl = {
    enableTestMode,
    enableParallelMode,
    confirmParallelMode,
    enableProductionMode,
    confirmProductionMode,
    getMigrationStatus,
    control: migrationControl
  };

  console.log('');
  console.log('📋 Migration Control Available:');
  console.log('   migrationControl.enableTestMode()      - Safe testing mode');
  console.log('   migrationControl.enableParallelMode()  - Write to both systems');
  console.log('   migrationControl.enableProductionMode() - New API only');
  console.log('   migrationControl.getMigrationStatus()  - Current status');
  console.log('');
}

// ============================================
// EXPORTS
// ============================================

export { migrationControl };
export default migrationControl;