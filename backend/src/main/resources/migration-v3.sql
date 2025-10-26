-- Migration Script V3: Add Animation Speed and Resume Upload Features
-- Run this on existing database to add new columns without losing data
-- Note: Duplicate column errors are safe to ignore

-- Add animation speed control column to profile table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'name_animation_speed') = 0,
    'ALTER TABLE profile ADD COLUMN name_animation_speed DOUBLE DEFAULT 2.5 AFTER expertise_cards',
    'SELECT "Column name_animation_speed already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add resume file URL column to profile table
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = 'portfolio_db' AND table_name = 'profile' AND column_name = 'resume_file_url') = 0,
    'ALTER TABLE profile ADD COLUMN resume_file_url VARCHAR(500) AFTER name_animation_speed',
    'SELECT "Column resume_file_url already exists" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Set default animation speed for existing profiles
UPDATE profile SET name_animation_speed = 2.5 WHERE name_animation_speed IS NULL;

SELECT '✓ Migration V3 completed successfully!' AS status;
