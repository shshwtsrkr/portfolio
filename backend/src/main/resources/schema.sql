-- Optimized MySQL Schema for Portfolio Website

-- Profile table (contains single profile information)
CREATE TABLE IF NOT EXISTS profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    about TEXT NOT NULL,
    profile_image_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    email_url VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    content LONGTEXT,
    date DATE NOT NULL,
    thumbnail_url VARCHAR(500),
    external_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date DESC),
    INDEX idx_title (title(100)),
    FULLTEXT INDEX idx_fulltext_content (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    technologies VARCHAR(500),
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    preview_image_url VARCHAR(500),
    status VARCHAR(50) NOT NULL,
    completed_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_completed_date (completed_date),
    INDEX idx_title (title(100)),
    FULLTEXT INDEX idx_fulltext_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    authors VARCHAR(500),
    venue VARCHAR(300),
    publication_year INT,
    abstract_text TEXT,
    doi VARCHAR(200),
    pdf_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    code_url VARCHAR(500),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (publication_year DESC),
    INDEX idx_status (status),
    INDEX idx_title (title(100)),
    FULLTEXT INDEX idx_fulltext_abstract (title, abstract_text, authors)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
