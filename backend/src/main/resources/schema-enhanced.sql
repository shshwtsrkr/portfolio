-- Enhanced MySQL Schema for Portfolio Website with Admin Tool Support

-- Navbar Configuration table (for reordering sections)
CREATE TABLE IF NOT EXISTS navbar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    section_name VARCHAR(50) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profile table (enhanced with typing animation, socials, tech stack)
CREATE TABLE IF NOT EXISTS profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    about TEXT NOT NULL,
    profile_image_url VARCHAR(500),

    -- Typing animation texts (JSON array: ["Text 1", "Text 2", ...])
    typing_animation_texts JSON,

    -- One-liner with highlights (JSON: {"text": "Building...", "highlights": [{"word": "deep learning", "color": "#9333ea"}]})
    oneliner_config JSON,

    -- Socials (JSON array: [{"platform": "github", "url": "...", "icon": "FaGithub"}])
    socials JSON,

    -- Tech stack (JSON array: [{"name": "PyTorch", "icon": "SiPytorch", "color": "#EE4C2C"}])
    tech_stack JSON,

    -- Expertise cards (JSON array: [{"title": "...", "description": "...", "icon": "🧠"}])
    expertise_cards JSON,

    -- Legacy fields (kept for backward compatibility)
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    email_url VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blogs table (enhanced with tags, ordering, read duration)
CREATE TABLE IF NOT EXISTS blogs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    content LONGTEXT,
    date DATE NOT NULL,
    thumbnail_url VARCHAR(500),
    external_url VARCHAR(500),

    -- New fields for admin control
    tag VARCHAR(100),
    tag_color VARCHAR(50) DEFAULT '#6366f1',
    read_duration INT DEFAULT 5,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date DESC),
    INDEX idx_order (display_order),
    INDEX idx_tag (tag),
    INDEX idx_title (title(100)),
    INDEX idx_published (is_published),
    FULLTEXT INDEX idx_fulltext_content (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table (enhanced with ordering)
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

    -- New fields for admin control
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_order (display_order),
    INDEX idx_completed_date (completed_date),
    INDEX idx_title (title(100)),
    INDEX idx_published (is_published),
    FULLTEXT INDEX idx_fulltext_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Publications table (enhanced with citations and ordering)
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

    -- New fields for admin control
    show_citations BOOLEAN DEFAULT FALSE,
    citation_count INT DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (publication_year DESC),
    INDEX idx_order (display_order),
    INDEX idx_status (status),
    INDEX idx_title (title(100)),
    INDEX idx_published (is_published),
    FULLTEXT INDEX idx_fulltext_abstract (title, abstract_text, authors)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default navbar configuration
INSERT IGNORE INTO navbar_config (section_name, display_order, is_visible) VALUES
('Home', 1, TRUE),
('Blogs', 2, TRUE),
('Projects', 3, TRUE),
('Publications', 4, TRUE);
