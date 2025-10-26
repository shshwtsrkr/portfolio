-- MySQL Setup Script for Portfolio Backend
-- Run this script as root user: mysql -u root -p < setup-mysql.sql

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password in production!)
CREATE USER IF NOT EXISTS 'portfolio_user'@'localhost' IDENTIFIED BY 'portfolio_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show databases and users
SELECT 'Database created successfully!' AS message;
SELECT User, Host FROM mysql.user WHERE User = 'portfolio_user';
