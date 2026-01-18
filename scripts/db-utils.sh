#!/bin/bash
# Database Utility Scripts for AI Marketplace

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Database connection info
DB_USER="${DB_USER:-ai_marketplace}"
DB_NAME="${DB_NAME:-ai_marketplace}"
CONTAINER_NAME="ai_marketplace_db"

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        print_error "PostgreSQL container is not running"
        echo "Run 'make up' to start services"
        exit 1
    fi
}

# Database statistics
db_stats() {
    check_container
    print_info "Database Statistics"
    echo ""

    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC;
    "
}

# Table row counts
table_counts() {
    check_container
    print_info "Table Row Counts"
    echo ""

    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname,
            tablename,
            n_live_tup AS row_count
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
    "
}

# Active connections
active_connections() {
    check_container
    print_info "Active Database Connections"
    echo ""

    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            pid,
            usename,
            application_name,
            client_addr,
            state,
            query_start,
            state_change
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME'
        ORDER BY query_start DESC;
    "
}

# Reset database (drops and recreates)
reset_db() {
    check_container
    print_warning "This will delete ALL data in the database!"
    read -p "Are you sure? (type 'yes' to confirm): " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "Database reset cancelled"
        exit 0
    fi

    print_info "Dropping database..."
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

    print_info "Creating database..."
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    print_info "Running initialization scripts..."
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f /docker-entrypoint-initdb.d/01-init-database.sql

    print_success "Database reset complete"
}

# Export schema
export_schema() {
    check_container
    local output_file="${1:-schema_$(date +%Y%m%d_%H%M%S).sql}"

    print_info "Exporting schema to $output_file..."
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --schema-only > "$output_file"

    print_success "Schema exported to $output_file"
}

# Export data only
export_data() {
    check_container
    local output_file="${1:-data_$(date +%Y%m%d_%H%M%S).sql}"

    print_info "Exporting data to $output_file..."
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --data-only > "$output_file"

    print_success "Data exported to $output_file"
}

# Create migration file
create_migration() {
    local migration_name="$1"

    if [ -z "$migration_name" ]; then
        print_error "Migration name is required"
        echo "Usage: $0 create-migration <migration_name>"
        exit 1
    fi

    local timestamp=$(date +%Y%m%d%H%M%S)
    local filename="migrations/${timestamp}_${migration_name}.sql"

    mkdir -p migrations

    cat > "$filename" << EOF
-- Migration: $migration_name
-- Created: $(date +"%Y-%m-%d %H:%M:%S")

-- Up Migration
BEGIN;

-- Add your migration SQL here

COMMIT;

-- Down Migration (for rollback)
-- BEGIN;

-- Add your rollback SQL here (commented out)

-- COMMIT;
EOF

    print_success "Migration created: $filename"
}

# Run SQL file
run_sql() {
    check_container
    local sql_file="$1"

    if [ -z "$sql_file" ]; then
        print_error "SQL file is required"
        echo "Usage: $0 run-sql <file.sql>"
        exit 1
    fi

    if [ ! -f "$sql_file" ]; then
        print_error "File not found: $sql_file"
        exit 1
    fi

    print_info "Executing SQL file: $sql_file"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$sql_file"

    print_success "SQL executed successfully"
}

# Vacuum database
vacuum_db() {
    check_container
    print_info "Running VACUUM ANALYZE on database..."
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;"
    print_success "VACUUM ANALYZE complete"
}

# Show help
show_help() {
    echo "Database Utility Scripts"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  stats              Show database and table size statistics"
    echo "  counts             Show row counts for all tables"
    echo "  connections        Show active database connections"
    echo "  reset              Reset database (drops and recreates)"
    echo "  export-schema      Export database schema only"
    echo "  export-data        Export data only"
    echo "  create-migration   Create a new migration file"
    echo "  run-sql <file>     Execute SQL file"
    echo "  vacuum             Run VACUUM ANALYZE"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 stats"
    echo "  $0 export-schema schema_backup.sql"
    echo "  $0 create-migration add_user_preferences"
    echo "  $0 run-sql migrations/001_initial.sql"
}

# Main command router
case "$1" in
    stats)
        db_stats
        ;;
    counts)
        table_counts
        ;;
    connections)
        active_connections
        ;;
    reset)
        reset_db
        ;;
    export-schema)
        export_schema "$2"
        ;;
    export-data)
        export_data "$2"
        ;;
    create-migration)
        create_migration "$2"
        ;;
    run-sql)
        run_sql "$2"
        ;;
    vacuum)
        vacuum_db
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
