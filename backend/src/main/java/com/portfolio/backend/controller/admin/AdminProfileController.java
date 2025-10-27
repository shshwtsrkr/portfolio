package com.portfolio.backend.controller.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.backend.model.Profile;
import com.portfolio.backend.service.AsciiArtService;
import com.portfolio.backend.service.FileUploadService;
import com.portfolio.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.nio.file.Path;

@Controller
@RequestMapping("/admin/profile")
public class AdminProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private FileUploadService fileUploadService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private AsciiArtService asciiArtService;

    private Profile ensureProfile(Long id) {
        if (id != null) {
            return profileService.getProfileById(id)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
        }

        return profileService.getAllProfiles().stream()
                .findFirst()
                .orElseGet(() -> profileService.createProfile(new Profile()));
    }

    private static final String DEFAULT_TYPING_JSON = "[\"Deep Learning Researcher\", \"Computer Vision Expert\", \"DevOps Engineer\"]";
    private static final String DEFAULT_ONELINER_JSON = """
            {
              "text": "Building intelligent systems at the intersection of deep learning, computer vision, and scalable infrastructure",
              "highlights": [
                { "word": "deep learning", "color": "#9333ea" },
                { "word": "computer vision", "color": "#2563eb" },
                { "word": "scalable infrastructure", "color": "#16a34a" }
              ]
            }
            """;
    private static final String DEFAULT_SOCIALS_JSON = """
            [
              { "platform": "github", "url": "https://github.com/username", "icon": "FaGithub", "color": "#9333ea" },
              { "platform": "linkedin", "url": "https://linkedin.com/in/username", "icon": "FaLinkedin", "color": "#2563eb" },
              { "platform": "twitter", "url": "https://twitter.com/username", "icon": "FaTwitter", "color": "#0ea5e9" }
            ]
            """;
    private static final String DEFAULT_TECH_STACK_JSON = """
            [
              { "name": "Python", "icon": "SiPython", "color": "#3776AB" },
              { "name": "Shell Scripting", "icon": "SiGnubash", "color": "#4EAA25" },
              { "name": "PyTorch", "icon": "SiPytorch", "color": "#EE4C2C" },
              { "name": "TensorFlow", "icon": "SiTensorflow", "color": "#FF6F00" },
              { "name": "OpenCV", "icon": "SiOpencv", "color": "#5C3EE8" },
              { "name": "Flask", "icon": "SiFlask", "color": "#FFFFFF" },
              { "name": "NumPy", "icon": "SiNumpy", "color": "#013243" },
              { "name": "Seaborn", "icon": "FaCode", "color": "#444876" },
              { "name": "Django", "icon": "SiDjango", "color": "#092E20" },
              { "name": "Java", "icon": "FaJava", "color": "#007396" },
              { "name": "AWS", "icon": "FaAws", "color": "#FF9900" },
              { "name": "Docker", "icon": "SiDocker", "color": "#2496ED" },
              { "name": "Kubernetes", "icon": "SiKubernetes", "color": "#326CE5" },
              { "name": "JavaScript", "icon": "SiJavascript", "color": "#F7DF1E" },
              { "name": "Linux", "icon": "FaLinux", "color": "#FCC624" },
              { "name": "Cloudflare", "icon": "SiCloudflare", "color": "#F38020" },
              { "name": "Git", "icon": "SiGit", "color": "#F05032" },
              { "name": "GitHub", "icon": "FaGithub", "color": "#181717" },
              { "name": "Windows", "icon": "FaWindows", "color": "#0078D6" }
            ]
            """;
    private static final String DEFAULT_EXPERTISE_JSON = """
            [
              { "title": "Deep Learning Research", "description": "Neural architectures and model optimisation", "icon": "🧠" },
              { "title": "Computer Vision", "description": "Detection, segmentation, visual understanding", "icon": "👁️" },
              { "title": "DevOps & MLOps", "description": "Pipelines, containerisation, production deployment", "icon": "⚙️" }
            ]
            """;

    private String prettyJson(String raw, String fallback) {
        String source = (raw == null || raw.isBlank()) ? fallback : raw;
        if (source == null || source.isBlank()) {
            return "";
        }
        try {
            JsonNode node = objectMapper.readTree(source);
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        } catch (Exception e) {
            return source.trim();
        }
    }

    // Legacy profile editor (kept for backward compatibility)
    @GetMapping
    public String editProfile(Model model) {
        Profile profile = profileService.getAllProfiles().stream()
                .findFirst()
                .orElse(new Profile());
        model.addAttribute("profile", profile);
        return "admin/profile/form";
    }

    @PostMapping("/save")
    public String saveProfile(@ModelAttribute Profile profile) {
        if (profile.getId() != null) {
            profileService.updateProfile(profile.getId(), profile);
        } else {
            profileService.createProfile(profile);
        }
        return "redirect:/admin/dashboard";
    }

    // NEW: Home Page Editor
    @GetMapping("/home-editor")
    public String showHomeEditor(Model model) {
        Profile profile = profileService.getAllProfiles().stream()
                .findFirst()
                .orElse(new Profile());
        model.addAttribute("profile", profile);

        model.addAttribute("typingAnimationJson", prettyJson(profile.getTypingAnimationTexts(), DEFAULT_TYPING_JSON));
        model.addAttribute("typingAnimationExample", prettyJson(DEFAULT_TYPING_JSON, DEFAULT_TYPING_JSON));

        model.addAttribute("onelinerJson", prettyJson(profile.getOnelinerConfig(), DEFAULT_ONELINER_JSON));
        model.addAttribute("onelinerExample", prettyJson(DEFAULT_ONELINER_JSON, DEFAULT_ONELINER_JSON));

        model.addAttribute("socialsJson", prettyJson(profile.getSocials(), DEFAULT_SOCIALS_JSON));
        model.addAttribute("socialsExample", prettyJson(DEFAULT_SOCIALS_JSON, DEFAULT_SOCIALS_JSON));

        model.addAttribute("techStackJson", prettyJson(profile.getTechStack(), DEFAULT_TECH_STACK_JSON));
        model.addAttribute("techStackExample", prettyJson(DEFAULT_TECH_STACK_JSON, DEFAULT_TECH_STACK_JSON));

        model.addAttribute("expertiseJson", prettyJson(profile.getExpertiseCards(), DEFAULT_EXPERTISE_JSON));
        model.addAttribute("expertiseExample", prettyJson(DEFAULT_EXPERTISE_JSON, DEFAULT_EXPERTISE_JSON));

        return "admin/home-editor";
    }

    @PostMapping("/update-basic")
    public String updateBasicInfo(
            @RequestParam(required = false) Long id,
            @RequestParam String name,
            @RequestParam String title,
            @RequestParam String about,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setName(name);
            profile.setTitle(title);
            profile.setAbout(about);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Basic info updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-typing")
    public String updateTypingTexts(
            @RequestParam(required = false) Long id,
            @RequestParam String typingAnimationTexts,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setTypingAnimationTexts(typingAnimationTexts);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Typing animation updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-oneliner")
    public String updateOneliner(
            @RequestParam(required = false) Long id,
            @RequestParam String onelinerConfig,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setOnelinerConfig(onelinerConfig);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "One-liner updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-socials")
    public String updateSocials(
            @RequestParam(required = false) Long id,
            @RequestParam String socials,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setSocials(socials);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Socials updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-tech-stack")
    public String updateTechStack(
            @RequestParam(required = false) Long id,
            @RequestParam String techStack,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setTechStack(techStack);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Tech stack updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-expertise")
    public String updateExpertiseCards(
            @RequestParam(required = false) Long id,
            @RequestParam String expertiseCards,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            profile.setExpertiseCards(expertiseCards);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Expertise cards updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/upload-profile-image")
    public String uploadProfileImage(
            @RequestParam(required = false) Long id,
            @RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            if (profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isEmpty()) {
                fileUploadService.deleteFile(profile.getProfileImageUrl());
            }

            String fileUrl = fileUploadService.uploadImage(file, "profile");
            profile.setProfileImageUrl(fileUrl);

            // Delete old ASCII image if exists
            if (profile.getAsciiImageUrl() != null && !profile.getAsciiImageUrl().isEmpty()) {
                fileUploadService.deleteFile(profile.getAsciiImageUrl());
            }

            boolean asciiSuccess = false;
            try {
                String relativePath = fileUrl.startsWith("/uploads/")
                        ? fileUrl.substring("/uploads/".length())
                        : fileUrl.replaceFirst("^/", "");
                Path absolutePath = Path.of(fileUploadService.getUploadDirPath(), relativePath);

                // Generate ASCII art as an actual image file
                String asciiImageUrl = asciiArtService.generateAsciiImage(absolutePath, "profile");
                profile.setAsciiImageUrl(asciiImageUrl);
                asciiSuccess = true;
            } catch (Exception e) {
                profile.setAsciiImageUrl(null);
                redirectAttributes.addFlashAttribute("errorMessage", "Image uploaded, but ASCII conversion failed: " + e.getMessage());
            }
            profileService.updateProfile(profile.getId(), profile);

            if (asciiSuccess) {
                redirectAttributes.addFlashAttribute("successMessage", "Profile image & ASCII portrait updated!");
            } else {
                redirectAttributes.addFlashAttribute("successMessage", "Profile image uploaded!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/update-animation-speed")
    public String updateAnimationSpeed(
            @RequestParam(required = false) Long id,
            @RequestParam Double animationSpeed,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            if (animationSpeed < 0.1 || animationSpeed > 10.0) {
                redirectAttributes.addFlashAttribute("errorMessage", "Animation speed must be between 0.1 and 10 seconds");
                return "redirect:/admin/profile/home-editor";
            }

            profile.setNameAnimationSpeed(animationSpeed);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Animation speed updated to " + animationSpeed + "s!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }

    @PostMapping("/upload-resume")
    public String uploadResume(
            @RequestParam(required = false) Long id,
            @RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) {

        try {
            Profile profile = ensureProfile(id);

            // Validate file is PDF
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                redirectAttributes.addFlashAttribute("errorMessage", "Only PDF files are allowed");
                return "redirect:/admin/profile/home-editor";
            }

            // Delete old resume if exists
            if (profile.getResumeFileUrl() != null && !profile.getResumeFileUrl().isEmpty()) {
                fileUploadService.deleteFile(profile.getResumeFileUrl());
            }

            // Upload new resume PDF
            String fileUrl = fileUploadService.uploadFile(file, "resume");
            profile.setResumeFileUrl(fileUrl);
            profileService.updateProfile(profile.getId(), profile);

            redirectAttributes.addFlashAttribute("successMessage", "Resume uploaded successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Failed: " + e.getMessage());
        }

        return "redirect:/admin/profile/home-editor";
    }
}
