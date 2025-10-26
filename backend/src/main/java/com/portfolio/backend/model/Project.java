package com.portfolio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String technologies;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(nullable = false)
    private String status; // "Completed", "Active Development"

    @Column(name = "completed_date")
    private String completedDate; // Format: "Month Year" e.g., "Jan 2024"

    @Column(name = "show_code_button", nullable = false)
    private Boolean showCodeButton = true;

    @Column(name = "show_live_demo_button", nullable = false)
    private Boolean showLiveDemoButton = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
}
