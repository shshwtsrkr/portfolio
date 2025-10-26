# Portfolio Backend - MySQL Setup Guide

Complete guide for setting up MySQL database for your portfolio website on a VPS or local machine.

## Table of Contents
- [Quick Start (Automated)](#quick-start-automated)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Automated)

For VPS or production setup, use the automated setup script:

```bash
# Make the script executable
chmod +x setup-database.sh

# Run the automated setup
./setup-database.sh
```

This script will:
- ✅ Check MySQL installation
- ✅ Create database and user
- ✅ Create optimized schema
- ✅ Insert sample data
- ✅ Verify the setup
- ✅ Display connection details

---

## Manual Setup

### Step 1: Install MySQL 8.0

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

**CentOS/RHEL:**
```bash
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
```

### Step 2: Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database
- Reload privilege tables

### Step 3: Create Database and User

Run the setup SQL script:

```bash
sudo mysql -u root -p < setup-mysql.sql
```

Or manually execute:

```sql
-- Login to MySQL
sudo mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create user (CHANGE PASSWORD IN PRODUCTION!)
CREATE USER IF NOT EXISTS 'portfolio_user'@'localhost'
  IDENTIFIED BY 'portfolio_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON portfolio_db.*
  TO 'portfolio_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Create Tables

The schema is automatically created by Spring Boot using `schema.sql`.

Or manually create tables:

```bash
mysql -u portfolio_user -p portfolio_db < src/main/resources/schema.sql
```

### Step 5: Insert Sample Data

The data is automatically inserted by Spring Boot using `data.sql`.

Or manually insert data:

```bash
mysql -u portfolio_user -p portfolio_db < src/main/resources/data.sql
```

---

## Configuration

### Application Properties

Located at: `src/main/resources/application.properties`

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/portfolio_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=portfolio_user
spring.datasource.password=portfolio_pass
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.defer-datasource-initialization=true

# Hibernate performance optimizations
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# SQL initialization
spring.sql.init.mode=always
spring.sql.init.continue-on-error=false
```

### Production Configuration

**For VPS/Production, use environment variables:**

```bash
# Create a .env file or export environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=portfolio_db
export DB_USERNAME=portfolio_user
export DB_PASSWORD=your_secure_password_here
```

Update `application-prod.properties`:

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&requireSSL=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.sql.init.mode=never
```

---

## Verification

### 1. Test MySQL Connection

```bash
mysql -u portfolio_user -p
# Enter password: portfolio_pass

# Inside MySQL shell:
SHOW DATABASES;
USE portfolio_db;
SHOW TABLES;
SELECT COUNT(*) FROM profile;
SELECT COUNT(*) FROM blogs;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM publications;
EXIT;
```

### 2. Check Table Structure

```bash
mysql -u portfolio_user -p portfolio_db -e "DESCRIBE profile;"
mysql -u portfolio_user -p portfolio_db -e "DESCRIBE blogs;"
mysql -u portfolio_user -p portfolio_db -e "DESCRIBE projects;"
mysql -u portfolio_user -p portfolio_db -e "DESCRIBE publications;"
```

### 3. Verify Data

```bash
mysql -u portfolio_user -p portfolio_db -e "SELECT * FROM profile;"
mysql -u portfolio_user -p portfolio_db -e "SELECT id, title FROM blogs;"
mysql -u portfolio_user -p portfolio_db -e "SELECT id, title FROM projects;"
mysql -u portfolio_user -p portfolio_db -e "SELECT id, title FROM publications;"
```

### 4. Build and Run Application

```bash
# Build the application
mvn clean install

# Run Spring Boot
mvn spring-boot:run

# Or run the JAR
java -jar target/portfolio-backend-0.0.1-SNAPSHOT.jar
```

### 5. Test API Endpoints

```bash
# Test profile endpoint
curl http://localhost:8080/api/profile

# Test blogs endpoint
curl http://localhost:8080/api/blogs

# Test projects endpoint
curl http://localhost:8080/api/projects

# Test publications endpoint
curl http://localhost:8080/api/publications

# Test health (if actuator is enabled)
curl http://localhost:8080/actuator/health
```

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profile` | User profile information | Single row, social media links |
| `blogs` | Blog posts | Full-text search, date indexing |
| `projects` | Portfolio projects | Status tracking, technology tags |
| `publications` | Research publications | Year indexing, DOI, PDF links |

### Schema Optimizations

- **Character Set**: UTF-8MB4 (supports emojis and international characters)
- **Engine**: InnoDB (ACID compliance, foreign key support)
- **Indexes**: Optimized for common query patterns
- **Full-Text Search**: Enabled on content fields
- **Timestamps**: Automatic `created_at` and `updated_at`

---

## Troubleshooting

### Connection Refused

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check MySQL port
sudo netstat -tlnp | grep 3306
sudo lsof -i :3306
```

### Access Denied

```bash
# Reset user password
sudo mysql -u root -p
ALTER USER 'portfolio_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Update application.properties with new password
```

### Tables Not Created

```bash
# Check Hibernate configuration
# Ensure spring.jpa.hibernate.ddl-auto=update in application.properties

# Manually create tables
mysql -u portfolio_user -p portfolio_db < src/main/resources/schema.sql
```

### Data Not Inserted

```bash
# Check if data.sql is in the correct location
ls -l src/main/resources/data.sql

# Manually insert data
mysql -u portfolio_user -p portfolio_db < src/main/resources/data.sql

# Check for errors in Spring Boot logs
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -ti :8080

# Kill the process
lsof -ti :8080 | xargs kill -9

# Or change the port in application.properties
server.port=8081
```

### Character Encoding Issues

```bash
# Check MySQL character set
mysql -u portfolio_user -p -e "SHOW VARIABLES LIKE 'character_set%';"

# Set UTF-8 in MySQL config (/etc/mysql/my.cnf)
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Restart MySQL
sudo systemctl restart mysql
```

---

## Database Backup & Restore

### Backup

```bash
# Full backup
mysqldump -u portfolio_user -p portfolio_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
mysqldump -u portfolio_user -p portfolio_db profile blogs > backup_partial.sql

# Automated daily backup (add to crontab)
0 2 * * * /usr/bin/mysqldump -u portfolio_user -pportfolio_pass portfolio_db > /backups/portfolio_$(date +\%Y\%m\%d).sql
```

### Restore

```bash
# Restore from backup
mysql -u portfolio_user -p portfolio_db < backup_20250122_120000.sql

# Restore specific tables
mysql -u portfolio_user -p portfolio_db < backup_partial.sql
```

---

## Performance Monitoring

### Query Performance

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- View slow queries
SELECT * FROM mysql.slow_log;

-- Explain query execution
EXPLAIN SELECT * FROM blogs WHERE title LIKE '%search%';
```

### Connection Monitoring

```sql
-- Show active connections
SHOW PROCESSLIST;

-- Connection statistics
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- View connection variables
SHOW VARIABLES LIKE 'max_connections';
```

### Database Size

```sql
-- Database size
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'portfolio_db'
GROUP BY table_schema;

-- Table sizes
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'portfolio_db'
ORDER BY (data_length + index_length) DESC;
```

---

## Admin Panel Database Manager

Access the integrated MySQL database manager:

1. Login to admin panel: `http://localhost:8080/login`
2. Navigate to Database Manager: `http://localhost:8080/admin/database`

Features:
- ✅ Real-time connection status
- ✅ Database statistics (tables, rows, size)
- ✅ SQL query executor (SELECT queries only)
- ✅ Table browser with schema and data preview
- ✅ Terminal-themed interface

---

## Production Deployment Checklist

- [ ] Change default database password
- [ ] Use environment variables for credentials
- [ ] Enable SSL for MySQL connections
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Disable `spring.jpa.show-sql=false`
- [ ] Set `spring.sql.init.mode=never`
- [ ] Configure firewall to restrict MySQL port
- [ ] Set up automated backups
- [ ] Enable slow query log
- [ ] Configure connection pooling
- [ ] Monitor database performance
- [ ] Set up log rotation

---

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review Spring Boot logs: `logs/spring-boot-application.log`
- Check MySQL error log: `/var/log/mysql/error.log`

---

## Database Schema Version

**Current Version**: 1.0.0
**MySQL Version**: 8.0+
**Spring Boot Version**: 3.2.0
**Hibernate Version**: 6.3.1
