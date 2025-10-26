-- Migration Script V2: Add Admin Tool Enhancement Fields
-- Run this on existing database to add new columns without losing data
-- Note: Duplicate column errors are safe to ignore

-- Add new columns to profile table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'typing_animation_texts') = 0,
    'ALTER TABLE profile ADD COLUMN typing_animation_texts JSON AFTER profile_image_url',
    'SELECT "Column typing_animation_texts already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'oneliner_config') = 0,
    'ALTER TABLE profile ADD COLUMN oneliner_config JSON AFTER typing_animation_texts',
    'SELECT "Column oneliner_config already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'socials') = 0,
    'ALTER TABLE profile ADD COLUMN socials JSON AFTER oneliner_config',
    'SELECT "Column socials already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'tech_stack') = 0,
    'ALTER TABLE profile ADD COLUMN tech_stack JSON AFTER socials',
    'SELECT "Column tech_stack already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'expertise_cards') = 0,
    'ALTER TABLE profile ADD COLUMN expertise_cards JSON AFTER tech_stack',
    'SELECT "Column expertise_cards already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'ascii_portrait') = 0,
    'ALTER TABLE profile ADD COLUMN ascii_portrait TEXT AFTER email_url',
    'SELECT "Column ascii_portrait already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'ascii_image_url') = 0,
    'ALTER TABLE profile ADD COLUMN ascii_image_url VARCHAR(255) AFTER profile_image_url',
    'SELECT "Column ascii_image_url already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add new columns to blogs table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'blogs' AND column_name = 'tag') = 0,
    'ALTER TABLE blogs ADD COLUMN tag VARCHAR(100) AFTER external_url',
    'SELECT "Column tag already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'blogs' AND column_name = 'tag_color') = 0,
    'ALTER TABLE blogs ADD COLUMN tag_color VARCHAR(50) DEFAULT ''#6366f1'' AFTER tag',
    'SELECT "Column tag_color already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'blogs' AND column_name = 'read_duration') = 0,
    'ALTER TABLE blogs ADD COLUMN read_duration INT DEFAULT 5 AFTER tag_color',
    'SELECT "Column read_duration already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'blogs' AND column_name = 'display_order') = 0,
    'ALTER TABLE blogs ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER read_duration',
    'SELECT "Column display_order already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'blogs' AND column_name = 'is_published') = 0,
    'ALTER TABLE blogs ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER display_order',
    'SELECT "Column is_published already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add new columns to projects table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'projects' AND column_name = 'display_order') = 0,
    'ALTER TABLE projects ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER completed_date',
    'SELECT "Column display_order already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'projects' AND column_name = 'is_published') = 0,
    'ALTER TABLE projects ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER display_order',
    'SELECT "Column is_published already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add new columns to publications table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'show_citations') = 0,
    'ALTER TABLE publications ADD COLUMN show_citations BOOLEAN DEFAULT FALSE AFTER status',
    'SELECT "Column show_citations already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'citation_count') = 0,
    'ALTER TABLE publications ADD COLUMN citation_count INT DEFAULT 0 AFTER show_citations',
    'SELECT "Column citation_count already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'display_order') = 0,
    'ALTER TABLE publications ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER citation_count',
    'SELECT "Column display_order already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'is_published') = 0,
    'ALTER TABLE publications ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER display_order',
    'SELECT "Column is_published already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'show_pdf_button') = 0,
    'ALTER TABLE publications ADD COLUMN show_pdf_button TINYINT(1) NOT NULL DEFAULT 1 AFTER is_published',
    'SELECT "Column show_pdf_button already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'show_code_button') = 0,
    'ALTER TABLE publications ADD COLUMN show_code_button TINYINT(1) NOT NULL DEFAULT 1 AFTER show_pdf_button',
    'SELECT "Column show_code_button already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'publications' AND column_name = 'show_doi_button') = 0,
    'ALTER TABLE publications ADD COLUMN show_doi_button TINYINT(1) NOT NULL DEFAULT 1 AFTER show_code_button',
    'SELECT "Column show_doi_button already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix existing bit(1) columns to tinyint(1) if they were already created
ALTER TABLE publications MODIFY COLUMN show_pdf_button TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE publications MODIFY COLUMN show_code_button TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE publications MODIFY COLUMN show_doi_button TINYINT(1) NOT NULL DEFAULT 1;

-- Ensure all existing publications have buttons enabled by default
UPDATE publications SET show_code_button = 1 WHERE show_code_button IS NULL OR show_code_button = 0;
UPDATE publications SET show_pdf_button = 1 WHERE show_pdf_button IS NULL OR show_pdf_button = 0;
UPDATE publications SET show_doi_button = 1 WHERE show_doi_button IS NULL OR show_doi_button = 0;

-- Add button toggle columns to projects table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'projects' AND column_name = 'show_code_button') = 0,
    'ALTER TABLE projects ADD COLUMN show_code_button TINYINT(1) NOT NULL DEFAULT 1 AFTER is_published',
    'SELECT "Column show_code_button already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'projects' AND column_name = 'show_live_demo_button') = 0,
    'ALTER TABLE projects ADD COLUMN show_live_demo_button TINYINT(1) NOT NULL DEFAULT 1 AFTER show_code_button',
    'SELECT "Column show_live_demo_button already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure all existing projects have buttons enabled by default
UPDATE projects SET show_code_button = 1 WHERE show_code_button IS NULL OR show_code_button = 0;
UPDATE projects SET show_live_demo_button = 1 WHERE show_live_demo_button IS NULL OR show_live_demo_button = 0;

-- Create navbar_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS navbar_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    section_name VARCHAR(50) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default navbar configuration
INSERT IGNORE INTO navbar_config (section_name, display_order, is_visible) VALUES
('Home', 1, TRUE),
('Blogs', 2, TRUE),
('Projects', 3, TRUE),
('Publications', 4, TRUE);

-- Update existing records with default display orders (ordered by creation date)
-- Blogs display order
SET @row_number = 0;
SET @has_created_at = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE() AND table_name = 'blogs' AND column_name = 'created_at'
);
SET @sql = IF(
    @has_created_at > 0,
    'UPDATE blogs SET display_order = (@row_number:=@row_number + 1) ORDER BY created_at DESC',
    'UPDATE blogs SET display_order = (@row_number:=@row_number + 1) ORDER BY id DESC'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Projects display order
SET @row_number = 0;
SET @has_created_at = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE() AND table_name = 'projects' AND column_name = 'created_at'
);
SET @sql = IF(
    @has_created_at > 0,
    'UPDATE projects SET display_order = (@row_number:=@row_number + 1) ORDER BY created_at DESC',
    'UPDATE projects SET display_order = (@row_number:=@row_number + 1) ORDER BY id DESC'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Publications display order
SET @row_number = 0;
SET @has_created_at = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE() AND table_name = 'publications' AND column_name = 'created_at'
);
SET @sql = IF(
    @has_created_at > 0,
    'UPDATE publications SET display_order = (@row_number:=@row_number + 1) ORDER BY created_at DESC',
    'UPDATE publications SET display_order = (@row_number:=@row_number + 1) ORDER BY id DESC'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Initialize profile JSON fields with default data if NULL
UPDATE profile
SET
    typing_animation_texts = JSON_ARRAY(
        'Deep Learning Researcher',
        'Computer Vision Expert',
        'DevOps Engineer',
        'ML Systems Architect'
    )
WHERE typing_animation_texts IS NULL;

UPDATE profile
SET
    oneliner_config = JSON_OBJECT(
        'text', 'Building intelligent systems at the intersection of deep learning, computer vision, and scalable infrastructure',
        'highlights', JSON_ARRAY(
            JSON_OBJECT('word', 'deep learning', 'color', '#9333ea'),
            JSON_OBJECT('word', 'computer vision', 'color', '#2563eb'),
            JSON_OBJECT('word', 'scalable infrastructure', 'color', '#16a34a')
        )
    )
WHERE oneliner_config IS NULL;

UPDATE profile
SET
    tech_stack = JSON_ARRAY(
        JSON_OBJECT('name', 'Python', 'icon', 'SiPython', 'color', '#3776AB'),
        JSON_OBJECT('name', 'Shell Scripting', 'icon', 'SiGnubash', 'color', '#4EAA25'),
        JSON_OBJECT('name', 'PyTorch', 'icon', 'SiPytorch', 'color', '#EE4C2C'),
        JSON_OBJECT('name', 'TensorFlow', 'icon', 'SiTensorflow', 'color', '#FF6F00'),
        JSON_OBJECT('name', 'OpenCV', 'icon', 'SiOpencv', 'color', '#5C3EE8'),
        JSON_OBJECT('name', 'Flask', 'icon', 'SiFlask', 'color', '#FFFFFF'),
        JSON_OBJECT('name', 'NumPy', 'icon', 'SiNumpy', 'color', '#013243'),
        JSON_OBJECT('name', 'Seaborn', 'icon', 'FaCode', 'color', '#444876'),
        JSON_OBJECT('name', 'Django', 'icon', 'SiDjango', 'color', '#092E20'),
        JSON_OBJECT('name', 'Java', 'icon', 'FaJava', 'color', '#007396'),
        JSON_OBJECT('name', 'AWS', 'icon', 'FaAws', 'color', '#FF9900'),
        JSON_OBJECT('name', 'Docker', 'icon', 'SiDocker', 'color', '#2496ED'),
        JSON_OBJECT('name', 'Kubernetes', 'icon', 'SiKubernetes', 'color', '#326CE5'),
        JSON_OBJECT('name', 'JavaScript', 'icon', 'SiJavascript', 'color', '#F7DF1E'),
        JSON_OBJECT('name', 'Linux', 'icon', 'FaLinux', 'color', '#FCC624'),
        JSON_OBJECT('name', 'Cloudflare', 'icon', 'SiCloudflare', 'color', '#F38020'),
        JSON_OBJECT('name', 'Git', 'icon', 'SiGit', 'color', '#F05032'),
        JSON_OBJECT('name', 'GitHub', 'icon', 'FaGithub', 'color', '#181717'),
        JSON_OBJECT('name', 'Windows', 'icon', 'FaWindows', 'color', '#0078D6')
    )
WHERE tech_stack IS NULL;

-- Upgrade existing tech stack entries that were seeded with the older 12-item default
UPDATE profile
SET
    tech_stack = JSON_ARRAY(
        JSON_OBJECT('name', 'Python', 'icon', 'SiPython', 'color', '#3776AB'),
        JSON_OBJECT('name', 'Shell Scripting', 'icon', 'SiGnubash', 'color', '#4EAA25'),
        JSON_OBJECT('name', 'PyTorch', 'icon', 'SiPytorch', 'color', '#EE4C2C'),
        JSON_OBJECT('name', 'TensorFlow', 'icon', 'SiTensorflow', 'color', '#FF6F00'),
        JSON_OBJECT('name', 'OpenCV', 'icon', 'SiOpencv', 'color', '#5C3EE8'),
        JSON_OBJECT('name', 'Flask', 'icon', 'SiFlask', 'color', '#FFFFFF'),
        JSON_OBJECT('name', 'NumPy', 'icon', 'SiNumpy', 'color', '#013243'),
        JSON_OBJECT('name', 'Seaborn', 'icon', 'FaCode', 'color', '#444876'),
        JSON_OBJECT('name', 'Django', 'icon', 'SiDjango', 'color', '#092E20'),
        JSON_OBJECT('name', 'Java', 'icon', 'FaJava', 'color', '#007396'),
        JSON_OBJECT('name', 'AWS', 'icon', 'FaAws', 'color', '#FF9900'),
        JSON_OBJECT('name', 'Docker', 'icon', 'SiDocker', 'color', '#2496ED'),
        JSON_OBJECT('name', 'Kubernetes', 'icon', 'SiKubernetes', 'color', '#326CE5'),
        JSON_OBJECT('name', 'JavaScript', 'icon', 'SiJavascript', 'color', '#F7DF1E'),
        JSON_OBJECT('name', 'Linux', 'icon', 'FaLinux', 'color', '#FCC624'),
        JSON_OBJECT('name', 'Cloudflare', 'icon', 'SiCloudflare', 'color', '#F38020'),
        JSON_OBJECT('name', 'Git', 'icon', 'SiGit', 'color', '#F05032'),
        JSON_OBJECT('name', 'GitHub', 'icon', 'FaGithub', 'color', '#181717'),
        JSON_OBJECT('name', 'Windows', 'icon', 'FaWindows', 'color', '#0078D6')
    )
WHERE JSON_LENGTH(tech_stack) = 12;

UPDATE profile
SET
    expertise_cards = JSON_ARRAY(
        JSON_OBJECT(
            'title', 'Deep Learning Research',
            'description', 'Neural architectures, model optimization, and cutting-edge ML research',
            'icon', '🧠'
        ),
        JSON_OBJECT(
            'title', 'Computer Vision',
            'description', 'Object detection, image segmentation, and visual understanding systems',
            'icon', '👁️'
        ),
        JSON_OBJECT(
            'title', 'DevOps & MLOps',
            'description', 'Scalable ML pipelines, containerization, and production deployment',
            'icon', '⚙️'
        )
    )
WHERE expertise_cards IS NULL;

-- Build socials JSON from existing URL fields
UPDATE profile
SET
    socials = JSON_ARRAY(
        JSON_OBJECT('platform', 'github', 'url', github_url, 'icon', 'FaGithub', 'color', '#9333ea'),
        JSON_OBJECT('platform', 'linkedin', 'url', linkedin_url, 'icon', 'FaLinkedin', 'color', '#2563eb'),
        JSON_OBJECT('platform', 'twitter', 'url', twitter_url, 'icon', 'FaTwitter', 'color', '#0ea5e9'),
        JSON_OBJECT('platform', 'email', 'url', email_url, 'icon', 'FaEnvelope', 'color', '#f43f5e')
    )
WHERE socials IS NULL AND github_url IS NOT NULL;

SELECT '✓ Migration V2 completed successfully!' AS status;
