#!/bin/bash

################################################################################
# Portfolio Database Automated Setup Script
#
# This script automates the complete MySQL database setup for the portfolio
# website, including database creation, schema setup, and data insertion.
#
# Usage: ./setup-database.sh [OPTIONS]
#
# Options:
#   --db-name        Database name (default: portfolio_db)
#   --db-user        Database user (default: portfolio_user)
#   --db-pass        Database password (default: portfolio_pass)
#   --root-pass      MySQL root password (will prompt if not provided)
#   --skip-data      Skip sample data insertion
#   --help           Show this help message
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB_NAME="portfolio_db"
DB_USER="portfolio_user"
DB_PASS="portfolio_pass"
ROOT_PASS=""
SKIP_DATA=false

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

################################################################################
# Functions
################################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║           Portfolio Database Setup Script                     ║"
    echo "║           MySQL 8.0 Automated Configuration                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

print_usage() {
    echo "Usage: ./setup-database.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --db-name NAME      Database name (default: portfolio_db)"
    echo "  --db-user USER      Database user (default: portfolio_user)"
    echo "  --db-pass PASS      Database password (default: portfolio_pass)"
    echo "  --root-pass PASS    MySQL root password (will prompt if not provided)"
    echo "  --skip-data         Skip sample data insertion"
    echo "  --help              Show this help message"
    echo ""
    echo "Example:"
    echo "  ./setup-database.sh --db-name mydb --db-user myuser --db-pass mypass"
}

check_mysql_installed() {
    print_info "Checking if MySQL is installed..."
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version | awk '{print $5}' | cut -d',' -f1)
        print_step "MySQL $MYSQL_VERSION is installed"
        return 0
    else
        print_error "MySQL is not installed!"
        print_info "Please install MySQL 8.0+ first:"
        echo "  Ubuntu/Debian: sudo apt install mysql-server"
        echo "  CentOS/RHEL:   sudo yum install mysql-server"
        echo "  macOS:         brew install mysql"
        exit 1
    fi
}

check_mysql_running() {
    print_info "Checking if MySQL is running..."

    # Try different methods to check if MySQL is running
    if systemctl is-active --quiet mysql 2>/dev/null || \
       systemctl is-active --quiet mysqld 2>/dev/null || \
       pgrep -x mysqld > /dev/null || \
       mysql -e "SELECT 1" &> /dev/null; then
        print_step "MySQL service is running"
        return 0
    else
        print_warning "MySQL service is not running"
        print_info "Attempting to start MySQL..."

        if command -v systemctl &> /dev/null; then
            sudo systemctl start mysql 2>/dev/null || sudo systemctl start mysqld 2>/dev/null || true
        else
            print_error "Cannot start MySQL automatically. Please start MySQL manually."
            exit 1
        fi

        sleep 2

        # Check again
        if pgrep -x mysqld > /dev/null; then
            print_step "MySQL service started successfully"
            return 0
        else
            print_error "Failed to start MySQL. Please start it manually and try again."
            exit 1
        fi
    fi
}

prompt_root_password() {
    if [ -z "$ROOT_PASS" ]; then
        echo -e "${YELLOW}"
        read -sp "Enter MySQL root password: " ROOT_PASS
        echo -e "${NC}"
        echo ""
    fi
}

test_root_connection() {
    print_info "Testing MySQL root connection..."
    if mysql -u root -p"$ROOT_PASS" -e "SELECT 1" &> /dev/null; then
        print_step "Successfully connected to MySQL as root"
        return 0
    else
        print_error "Failed to connect to MySQL with provided root password"
        print_info "Please ensure the root password is correct"
        exit 1
    fi
}

create_database_and_user() {
    print_info "Creating database and user..."

    mysql -u root -p"$ROOT_PASS" <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create user (drop if exists for clean setup)
DROP USER IF EXISTS '$DB_USER'@'localhost';
CREATE USER '$DB_USER'@'localhost'
  IDENTIFIED BY '$DB_PASS';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.*
  TO '$DB_USER'@'localhost';

FLUSH PRIVILEGES;
EOF

    if [ $? -eq 0 ]; then
        print_step "Database '$DB_NAME' and user '$DB_USER' created successfully"
    else
        print_error "Failed to create database and user"
        exit 1
    fi
}

create_schema() {
    print_info "Creating database schema..."

    if [ ! -f "$SCRIPT_DIR/src/main/resources/schema.sql" ]; then
        print_error "schema.sql not found at $SCRIPT_DIR/src/main/resources/schema.sql"
        exit 1
    fi

    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCRIPT_DIR/src/main/resources/schema.sql"

    if [ $? -eq 0 ]; then
        print_step "Database schema created successfully"
    else
        print_error "Failed to create database schema"
        exit 1
    fi
}

insert_sample_data() {
    if [ "$SKIP_DATA" = true ]; then
        print_warning "Skipping sample data insertion (--skip-data flag set)"
        return 0
    fi

    print_info "Inserting sample data..."

    if [ ! -f "$SCRIPT_DIR/src/main/resources/data.sql" ]; then
        print_warning "data.sql not found, skipping sample data insertion"
        return 0
    fi

    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCRIPT_DIR/src/main/resources/data.sql"

    if [ $? -eq 0 ]; then
        print_step "Sample data inserted successfully"
    else
        print_warning "Failed to insert sample data (this is optional)"
    fi
}

verify_setup() {
    print_info "Verifying database setup..."

    # Check tables
    TABLES=$(mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2)
    TABLE_COUNT=$(echo "$TABLES" | wc -l)

    if [ $TABLE_COUNT -ge 4 ]; then
        print_step "Found $TABLE_COUNT tables in database"
        echo "$TABLES" | while read -r table; do
            ROW_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tail -n 1)
            echo "    - $table: $ROW_COUNT rows"
        done
    else
        print_error "Expected at least 4 tables, found $TABLE_COUNT"
        exit 1
    fi
}

update_application_properties() {
    print_info "Updating application.properties..."

    PROPS_FILE="$SCRIPT_DIR/src/main/resources/application.properties"

    if [ ! -f "$PROPS_FILE" ]; then
        print_warning "application.properties not found, skipping update"
        return 0
    fi

    # Backup original file
    cp "$PROPS_FILE" "$PROPS_FILE.backup.$(date +%Y%m%d_%H%M%S)"

    # Update database credentials
    sed -i.tmp "s|spring.datasource.url=.*|spring.datasource.url=jdbc:mysql://localhost:3306/$DB_NAME?createDatabaseIfNotExist=true\&useSSL=false\&allowPublicKeyRetrieval=true\&serverTimezone=UTC|g" "$PROPS_FILE"
    sed -i.tmp "s|spring.datasource.username=.*|spring.datasource.username=$DB_USER|g" "$PROPS_FILE"
    sed -i.tmp "s|spring.datasource.password=.*|spring.datasource.password=$DB_PASS|g" "$PROPS_FILE"

    rm -f "$PROPS_FILE.tmp"

    print_step "application.properties updated with database credentials"
}

print_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              Setup Completed Successfully! ✓                   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Database Connection Details:${NC}"
    echo "  Host:     localhost"
    echo "  Port:     3306"
    echo "  Database: $DB_NAME"
    echo "  Username: $DB_USER"
    echo "  Password: $DB_PASS"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Build the application:"
    echo "     mvn clean install"
    echo ""
    echo "  2. Run the Spring Boot application:"
    echo "     mvn spring-boot:run"
    echo ""
    echo "  3. Access the API:"
    echo "     http://localhost:8080/api/profile"
    echo "     http://localhost:8080/api/blogs"
    echo "     http://localhost:8080/api/projects"
    echo "     http://localhost:8080/api/publications"
    echo ""
    echo "  4. Access admin panel:"
    echo "     http://localhost:8080/login"
    echo ""
    echo -e "${YELLOW}⚠ Production Security:${NC}"
    echo "  - Change the default database password"
    echo "  - Use environment variables for credentials"
    echo "  - Enable SSL for MySQL connections"
    echo ""
}

################################################################################
# Main Script
################################################################################

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --db-name)
                DB_NAME="$2"
                shift 2
                ;;
            --db-user)
                DB_USER="$2"
                shift 2
                ;;
            --db-pass)
                DB_PASS="$2"
                shift 2
                ;;
            --root-pass)
                ROOT_PASS="$2"
                shift 2
                ;;
            --skip-data)
                SKIP_DATA=true
                shift
                ;;
            --help)
                print_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done

    # Run setup steps
    print_header

    check_mysql_installed
    check_mysql_running
    prompt_root_password
    test_root_connection

    echo ""
    print_warning "This will create/recreate the database: $DB_NAME"
    print_warning "Database user: $DB_USER"
    read -p "Continue? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled by user"
        exit 0
    fi

    echo ""
    create_database_and_user
    create_schema
    insert_sample_data
    verify_setup
    update_application_properties

    echo ""
    print_summary
}

# Run main function
main "$@"
