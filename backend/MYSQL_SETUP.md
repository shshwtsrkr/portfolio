# MySQL Database Setup Guide

## Prerequisites
- MySQL 8.0 or higher installed
- MySQL server running

## Setup Steps

### 1. Install MySQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download and install from: https://dev.mysql.com/downloads/mysql/

### 2. Secure MySQL Installation (recommended)
```bash
sudo mysql_secure_installation
```

### 3. Create Database and User

Run the setup script:
```bash
cd /home/shash/portfolio/backend
sudo mysql -u root -p < setup-mysql.sql
```

Or manually execute:
```sql
CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'portfolio_user'@'localhost' IDENTIFIED BY 'portfolio_pass';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Verify Database Setup
```bash
mysql -u portfolio_user -p
# Enter password: portfolio_pass

# Inside MySQL shell:
SHOW DATABASES;
USE portfolio_db;
SHOW TABLES;
```

### 5. Update Maven Dependencies
```bash
cd /home/shash/portfolio/backend
mvn clean install
```

### 6. Start Spring Boot Application
```bash
mvn spring-boot:run
```

## Database Schema

The optimized schema includes:

- **profile**: User profile information with timestamps
- **blogs**: Blog posts with full-text search indexing
- **projects**: Project portfolio with status tracking
- **publications**: Research publications with year indexing

### Optimization Features:
- UTF-8MB4 character set (supports emojis and special characters)
- InnoDB engine for ACID compliance
- Indexed columns for faster queries
- Full-text search on content fields
- Automatic timestamps (created_at, updated_at)
- Batch insert optimization in Hibernate

## Admin Tools

### MySQL Workbench (GUI)
1. Download: https://dev.mysql.com/downloads/workbench/
2. Connect with:
   - Host: localhost
   - Port: 3306
   - Username: portfolio_user
   - Password: portfolio_pass
   - Database: portfolio_db

### phpMyAdmin (Web-based)
```bash
# Install phpMyAdmin
sudo apt install phpmyadmin

# Access at: http://localhost/phpmyadmin
```

### DBeaver (Universal Database Tool)
1. Download: https://dbeaver.io/download/
2. Create new MySQL connection with same credentials

### Command Line
```bash
mysql -u portfolio_user -p portfolio_db
```

## Configuration

Database settings in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/portfolio_db
spring.datasource.username=portfolio_user
spring.datasource.password=portfolio_pass
```

## Troubleshooting

### Connection Refused
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Access Denied
```sql
# Reset user password
ALTER USER 'portfolio_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Port Already in Use
```bash
# Check MySQL port
sudo netstat -tlnp | grep 3306

# Change port in my.cnf if needed
```

## Production Recommendations

1. **Change default password** in application.properties
2. **Use environment variables** for credentials:
   ```properties
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   ```
3. **Enable SSL** for connections
4. **Set up regular backups**:
   ```bash
   mysqldump -u portfolio_user -p portfolio_db > backup.sql
   ```
5. **Monitor performance** with slow query log
6. **Use connection pooling** (already configured via HikariCP)

## Performance Tuning

Current optimizations in application.properties:
- Batch size: 20
- Order inserts/updates: enabled
- Connection pooling: HikariCP (default)
- Query caching: enabled

Monitor with:
```sql
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
EXPLAIN SELECT * FROM blogs WHERE title LIKE '%search%';
```
