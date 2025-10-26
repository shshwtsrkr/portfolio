package com.portfolio.backend.service;

import com.portfolio.backend.model.Publication;
import com.portfolio.backend.repository.PublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublicationService {
    @Autowired
    private PublicationRepository publicationRepository;

    public List<Publication> getAllPublications() {
        return publicationRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Optional<Publication> getPublicationById(Long id) {
        return publicationRepository.findById(id);
    }

    public Publication createPublication(Publication publication) {
        return publicationRepository.save(publication);
    }

    public Publication updatePublication(Long id, Publication publicationDetails) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication not found"));

        publication.setTitle(publicationDetails.getTitle());
        publication.setAuthors(publicationDetails.getAuthors());
        publication.setVenue(publicationDetails.getVenue());
        publication.setYear(publicationDetails.getYear());
        publication.setAbstractText(publicationDetails.getAbstractText());
        publication.setDoi(publicationDetails.getDoi());
        publication.setPdfUrl(publicationDetails.getPdfUrl());
        publication.setThumbnailUrl(publicationDetails.getThumbnailUrl());
        publication.setCodeUrl(publicationDetails.getCodeUrl());
        publication.setStatus(publicationDetails.getStatus());
        publication.setShowCitations(publicationDetails.getShowCitations());
        publication.setCitationCount(publicationDetails.getCitationCount());
        publication.setShowPdfButton(publicationDetails.getShowPdfButton());
        publication.setShowCodeButton(publicationDetails.getShowCodeButton());
        publication.setShowDoiButton(publicationDetails.getShowDoiButton());
        publication.setDisplayOrder(publicationDetails.getDisplayOrder());
        publication.setIsPublished(publicationDetails.getIsPublished());

        return publicationRepository.save(publication);
    }

    public void deletePublication(Long id) {
        publicationRepository.deleteById(id);
    }
}
