-- Script to clean all demo/test data from the database
-- Run this ONCE on your VPS before adding your real data

USE portfolio_db;

-- Clear all existing data
DELETE FROM blogs WHERE id > 0;
DELETE FROM projects WHERE id > 0;
DELETE FROM publications WHERE id > 0;
DELETE FROM profile WHERE id > 0;

-- Reset auto-increment counters
ALTER TABLE blogs AUTO_INCREMENT = 1;
ALTER TABLE projects AUTO_INCREMENT = 1;
ALTER TABLE publications AUTO_INCREMENT = 1;
ALTER TABLE profile AUTO_INCREMENT = 1;

-- Insert your basic profile (update with your info)
INSERT INTO profile (
    name,
    title,
    about,
    name_animation_speed
) VALUES (
    'Your Name',
    'Your Title',
    'Your about text',
    2.5
);

SELECT '✓ Demo data cleaned successfully! Use admin tool to add your content.' AS status;
