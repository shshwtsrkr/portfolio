package com.portfolio.backend.service;

import com.portfolio.backend.model.Project;
import com.portfolio.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setTechnologies(projectDetails.getTechnologies());
        project.setGithubUrl(projectDetails.getGithubUrl());
        project.setLiveUrl(projectDetails.getLiveUrl());
        project.setPreviewImageUrl(projectDetails.getPreviewImageUrl());
        project.setStatus(projectDetails.getStatus());
        project.setCompletedDate(projectDetails.getCompletedDate());
        project.setDisplayOrder(projectDetails.getDisplayOrder());
        project.setIsPublished(projectDetails.getIsPublished());
        project.setShowCodeButton(projectDetails.getShowCodeButton());
        project.setShowLiveDemoButton(projectDetails.getShowLiveDemoButton());

        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
