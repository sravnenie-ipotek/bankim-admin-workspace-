#!/bin/bash

# BankIM Database Operations Script
# Comprehensive database management for CI/CD pipeline
# Supports migrations, backups, health checks, and rollbacks

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# CI/CD Integration
CI_MODE=${CI:-false}
GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}

# Colors (disabled in CI mode)
if [[ "$CI_MODE" == "true" ]]; then
    RED='' GREEN='' YELLOW='' BLUE='' NC=''
else
    RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' BLUE='\033[0;34m' NC='\033[0m'
fi

# Default configuration
ENVIRONMENT=${ENVIRONMENT:-"production"}
OPERATION=${1:-"help"}
DB_BACKUP_PATH=${DB_BACKUP_PATH:-"/var/backups/bankim/db"}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Database configurations
declare -A DB_CONFIGS=(
    ["content"]="${CONTENT_DATABASE_URL}"
    ["core"]="${CORE_DATABASE_URL}" 
    ["management"]="${MANAGEMENT_DATABASE_URL}"
)

print_header() {
    echo -e "${BLUE}
╔════════════════════════════════════════════════════════════════╗
║                  BankIM Database Operations                    ║
║                                                                ║
║  Environment: ${ENVIRONMENT^^}                                        ║
║  Operation: ${OPERATION}                                       ║
║  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')                      ║
╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${YELLOW}🔄 $1${NC}"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::$1"
    fi
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::notice::✅ $1"
    fi
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::error::❌ $1"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::warning::⚠️ $1"
    fi
}

validate_environment() {
    print_status "Validating database environment..."
    
    # Check if required tools are available
    for tool in psql pg_dump pg_restore; do
        if ! command -v $tool &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Validate database connections
    local db_errors=0
    for db_name in "${!DB_CONFIGS[@]}"; do
        local db_url="${DB_CONFIGS[$db_name]}"
        if [[ -z "$db_url" ]]; then
            print_warning "Database URL not configured for: $db_name"
            ((db_errors++))
        else
            if ! test_db_connection "$db_url" "$db_name"; then
                print_error "Cannot connect to database: $db_name"
                ((db_errors++))
            fi
        fi
    done
    
    if [[ $db_errors -gt 0 ]]; then
        print_error "$db_errors database connection(s) failed"
        exit 1
    fi
    
    print_success "Environment validation completed"
}

test_db_connection() {
    local db_url="$1"
    local db_name="$2"
    
    print_status "Testing connection to $db_name database..."
    
    if psql "$db_url" -c "SELECT version();" &>/dev/null; then
        print_success "Connected to $db_name database"
        return 0
    else
        print_error "Failed to connect to $db_name database"
        return 1
    fi
}

create_backup() {
    local db_name="$1"
    local db_url="${DB_CONFIGS[$db_name]}"
    
    if [[ -z "$db_url" ]]; then
        print_warning "Skipping backup for $db_name (not configured)"
        return 0
    fi
    
    print_status "Creating backup for $db_name database..."
    
    # Create backup directory
    mkdir -p "$DB_BACKUP_PATH"
    
    # Generate backup filename
    local backup_file="$DB_BACKUP_PATH/${db_name}-backup-$(date +%Y%m%d-%H%M%S).sql"
    local backup_compressed="${backup_file}.gz"
    
    # Create database backup
    if pg_dump "$db_url" --no-owner --no-privileges --verbose > "$backup_file" 2>/dev/null; then
        # Compress backup
        gzip "$backup_file"
        
        # Verify backup
        if [[ -f "$backup_compressed" ]] && [[ -s "$backup_compressed" ]]; then
            print_success "Backup created: $backup_compressed"
            
            # Store backup info for potential use
            echo "${db_name}:${backup_compressed}" >> "/tmp/db-backups-${ENVIRONMENT}.txt"
        else
            print_error "Backup verification failed for $db_name"
            return 1
        fi
    else
        print_error "Backup creation failed for $db_name"
        return 1
    fi
}

backup_all_databases() {
    print_status "Creating backups for all databases..."
    
    local backup_errors=0
    for db_name in "${!DB_CONFIGS[@]}"; do
        if ! create_backup "$db_name"; then
            ((backup_errors++))
        fi
    done
    
    if [[ $backup_errors -gt 0 ]]; then
        print_error "$backup_errors database backup(s) failed"
        exit 1
    fi
    
    print_success "All database backups completed"
    cleanup_old_backups
}

cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    if [[ -d "$DB_BACKUP_PATH" ]]; then
        # Remove backups older than retention period
        find "$DB_BACKUP_PATH" -name "*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
        
        # Show current backup status
        local backup_count=$(find "$DB_BACKUP_PATH" -name "*.sql.gz" | wc -l)
        print_success "Backup cleanup completed ($backup_count backups retained)"
    else
        print_warning "Backup directory does not exist: $DB_BACKUP_PATH"
    fi
}

restore_database() {
    local db_name="$1"
    local backup_file="$2"
    local db_url="${DB_CONFIGS[$db_name]}"
    
    if [[ -z "$db_url" ]]; then
        print_error "Database not configured: $db_name"
        return 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_status "Restoring $db_name database from $backup_file..."
    
    # Create temporary uncompressed file if needed
    local temp_backup="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        temp_backup="/tmp/$(basename "$backup_file" .gz)"
        gunzip -c "$backup_file" > "$temp_backup"
    fi
    
    # Restore database
    if psql "$db_url" < "$temp_backup" 2>/dev/null; then
        print_success "Database $db_name restored successfully"
        
        # Clean up temporary file
        if [[ "$backup_file" == *.gz ]]; then
            rm -f "$temp_backup"
        fi
        
        return 0
    else
        print_error "Database restoration failed for $db_name"
        
        # Clean up temporary file
        if [[ "$backup_file" == *.gz ]]; then
            rm -f "$temp_backup"
        fi
        
        return 1
    fi
}

run_migrations() {
    print_status "Running database migrations..."
    
    cd "$PROJECT_ROOT/packages/server"
    
    # Check if migration system exists
    if [[ ! -f "migrations/migration-runner.js" ]]; then
        print_warning "No migration system found - skipping"
        return 0
    fi
    
    # Run migrations with environment check
    if node migrations/migration-runner.js status; then
        print_status "Applying database migrations..."
        
        if node migrations/migration-runner.js migrate; then
            print_success "Database migrations completed"
        else
            print_error "Database migrations failed"
            return 1
        fi
    else
        print_warning "Migration status check failed - proceeding with caution"
    fi
}

validate_migrations() {
    print_status "Validating database migrations..."
    
    cd "$PROJECT_ROOT/packages/server"
    
    # Check if migration system exists
    if [[ ! -f "migrations/migration-runner.js" ]]; then
        print_success "No migrations to validate"
        return 0
    fi
    
    # Test migrations in dry-run mode if supported
    if node migrations/migration-runner.js validate 2>/dev/null; then
        print_success "Migration validation passed"
    else
        print_warning "Migration validation not supported or failed"
    fi
}

health_check_databases() {
    print_status "Running database health checks..."
    
    local health_errors=0
    for db_name in "${!DB_CONFIGS[@]}"; do
        local db_url="${DB_CONFIGS[$db_name]}"
        
        if [[ -z "$db_url" ]]; then
            print_warning "Database not configured: $db_name"
            continue
        fi
        
        print_status "Checking health of $db_name database..."
        
        # Basic connectivity check
        if ! psql "$db_url" -c "SELECT 1;" &>/dev/null; then
            print_error "$db_name database health check failed"
            ((health_errors++))
            continue
        fi
        
        # Performance check (query response time)
        local start_time=$(date +%s%3N)
        psql "$db_url" -c "SELECT NOW();" &>/dev/null
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [[ $response_time -gt 5000 ]]; then
            print_warning "$db_name database response time high: ${response_time}ms"
        else
            print_success "$db_name database healthy (${response_time}ms)"
        fi
        
        # Connection count check
        local connection_count=$(psql "$db_url" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
        if [[ -n "$connection_count" ]] && [[ $connection_count -gt 20 ]]; then
            print_warning "$db_name database has high connection count: $connection_count"
        fi
    done
    
    if [[ $health_errors -gt 0 ]]; then
        print_error "$health_errors database health check(s) failed"
        exit 1
    fi
    
    print_success "All database health checks passed"
}

show_database_status() {
    print_status "Database status summary..."
    
    for db_name in "${!DB_CONFIGS[@]}"; do
        local db_url="${DB_CONFIGS[$db_name]}"
        
        echo -e "\n${BLUE}📊 $db_name Database:${NC}"
        
        if [[ -z "$db_url" ]]; then
            echo "   Status: Not configured"
            continue
        fi
        
        if psql "$db_url" -c "SELECT 1;" &>/dev/null; then
            # Get database info
            local db_size=$(psql "$db_url" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs)
            local table_count=$(psql "$db_url" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            local connection_count=$(psql "$db_url" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
            
            echo "   Status: Connected ✅"
            echo "   Size: ${db_size:-Unknown}"
            echo "   Tables: ${table_count:-Unknown}"
            echo "   Connections: ${connection_count:-Unknown}"
        else
            echo "   Status: Connection failed ❌"
        fi
    done
    
    # Show recent backups
    if [[ -d "$DB_BACKUP_PATH" ]]; then
        echo -e "\n${BLUE}📦 Recent Backups:${NC}"
        find "$DB_BACKUP_PATH" -name "*.sql.gz" -type f -mtime -7 -exec ls -lh {} \; | head -5 | while read line; do
            echo "   $line"
        done
    fi
}

show_help() {
    echo -e "${BLUE}BankIM Database Operations${NC}"
    echo ""
    echo "Usage: $0 <operation> [options]"
    echo ""
    echo "Operations:"
    echo "  validate     - Validate database connections and environment"
    echo "  backup       - Create backups of all databases"
    echo "  restore      - Restore database from backup"
    echo "  migrate      - Run database migrations"
    echo "  validate-migrations - Validate migrations before applying"
    echo "  health       - Run comprehensive database health checks"
    echo "  status       - Show database status and information"
    echo "  cleanup      - Clean up old backups"
    echo "  help         - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  ENVIRONMENT          - Target environment (test/production)"
    echo "  CONTENT_DATABASE_URL - Content database connection string"
    echo "  CORE_DATABASE_URL    - Core database connection string"
    echo "  MANAGEMENT_DATABASE_URL - Management database connection string"
    echo "  DB_BACKUP_PATH       - Backup directory path"
    echo "  BACKUP_RETENTION_DAYS - Backup retention period"
    echo ""
    echo "Examples:"
    echo "  $0 validate                    # Validate all database connections"
    echo "  $0 backup                      # Backup all databases"
    echo "  $0 restore content backup.sql  # Restore content database"
    echo "  $0 health                      # Run health checks"
}

main() {
    print_header
    
    case $OPERATION in
        "validate")
            validate_environment
            ;;
        "backup")
            validate_environment
            backup_all_databases
            ;;
        "restore")
            if [[ $# -lt 3 ]]; then
                print_error "Usage: $0 restore <database_name> <backup_file>"
                exit 1
            fi
            validate_environment
            restore_database "$2" "$3"
            ;;
        "migrate")
            validate_environment
            run_migrations
            ;;
        "validate-migrations")
            validate_environment
            validate_migrations
            ;;
        "health")
            validate_environment
            health_check_databases
            ;;
        "status")
            show_database_status
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown operation: $OPERATION"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Script execution
main "$@"