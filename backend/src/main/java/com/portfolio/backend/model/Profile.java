package com.portfolio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String title;

    @Column(length = 3000)
    private String about;

    private String profileImageUrl;

    private String asciiImageUrl;

    // JSON fields for dynamic home page configuration
    @Column(columnDefinition = "json")
    private String typingAnimationTexts;

    @Column(columnDefinition = "json")
    private String onelinerConfig;

    @Column(columnDefinition = "json")
    private String socials;

    @Column(columnDefinition = "json")
    private String techStack;

    @Column(columnDefinition = "json")
    private String expertiseCards;

    // Animation and file settings
    private Double nameAnimationSpeed; // Speed in seconds for name fill animation (default 2.5)

    private String resumeFileUrl; // URL to uploaded resume PDF

    // Legacy fields (kept for backward compatibility)
    private String githubUrl;

    private String linkedinUrl;

    private String twitterUrl;

    private String emailUrl;

    @Column(columnDefinition = "text")
    private String asciiPortrait;
}
