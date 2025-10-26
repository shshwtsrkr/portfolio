package com.portfolio.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "publications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String authors;

    private String venue;

    @Column(name = "publication_year")
    private Integer year;

    @Column(name = "abstract_text", length = 3000)
    @JsonProperty("abstract")
    private String abstractText;

    private String doi;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "code_url")
    private String codeUrl;

    @Column(nullable = false)
    private String status; // "Under Preparation", "Submitted", "Under Review", "Accepted"

    @Column(name = "show_citations", nullable = false)
    private Boolean showCitations = false;

    @Column(name = "citation_count")
    private Integer citationCount = 0;

    @Column(name = "show_pdf_button", nullable = false)
    private Boolean showPdfButton = true;

    @Column(name = "show_code_button", nullable = false)
    private Boolean showCodeButton = true;

    @Column(name = "show_doi_button", nullable = false)
    private Boolean showDoiButton = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
}
