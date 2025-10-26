package com.portfolio.backend.service;

import com.portfolio.backend.model.Profile;
import com.portfolio.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {
    @Autowired
    private ProfileRepository profileRepository;

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Optional<Profile> getProfileById(Long id) {
        return profileRepository.findById(id);
    }

    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    public Profile updateProfile(Long id, Profile profileDetails) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setName(profileDetails.getName());
        profile.setTitle(profileDetails.getTitle());
        profile.setAbout(profileDetails.getAbout());
        profile.setProfileImageUrl(profileDetails.getProfileImageUrl());
        profile.setGithubUrl(profileDetails.getGithubUrl());
        profile.setLinkedinUrl(profileDetails.getLinkedinUrl());
        profile.setTwitterUrl(profileDetails.getTwitterUrl());
        profile.setEmailUrl(profileDetails.getEmailUrl());
        profile.setTypingAnimationTexts(profileDetails.getTypingAnimationTexts());
        profile.setOnelinerConfig(profileDetails.getOnelinerConfig());
        profile.setSocials(profileDetails.getSocials());
        profile.setTechStack(profileDetails.getTechStack());
        profile.setExpertiseCards(profileDetails.getExpertiseCards());
        profile.setAsciiPortrait(profileDetails.getAsciiPortrait());

        return profileRepository.save(profile);
    }

    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }
}
