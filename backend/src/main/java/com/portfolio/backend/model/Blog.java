package com.portfolio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 10000)
    private String content;

    private String date;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "external_url")
    private String externalUrl;

    @Column(length = 100)
    private String tag;

    @Column(name = "tag_color", length = 50)
    private String tagColor;

    @Column(name = "read_duration")
    private Integer readDuration;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
}
