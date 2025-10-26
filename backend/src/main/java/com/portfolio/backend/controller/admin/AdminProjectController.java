package com.portfolio.backend.controller.admin;

import com.portfolio.backend.model.Project;
import com.portfolio.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin/projects")
public class AdminProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public String listProjects(Model model) {
        model.addAttribute("projects", projectService.getAllProjects());
        return "admin/projects/list";
    }

    @GetMapping("/new")
    public String newProject(Model model) {
        model.addAttribute("project", new Project());
        return "admin/projects/form";
    }

    @GetMapping("/edit/{id}")
    public String editProject(@PathVariable Long id, Model model) {
        projectService.getProjectById(id).ifPresent(project -> model.addAttribute("project", project));
        return "admin/projects/form";
    }

    @PostMapping("/save")
    public String saveProject(@ModelAttribute Project project) {
        if (project.getId() != null) {
            projectService.updateProject(project.getId(), project);
        } else {
            projectService.createProject(project);
        }
        return "redirect:/admin/projects";
    }

    @GetMapping("/delete/{id}")
    public String deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return "redirect:/admin/projects";
    }

    @PostMapping("/reorder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> reorderProjects(@RequestBody List<Map<String, Object>> items) {
        Map<String, Object> response = new HashMap<>();
        try {
            for (Map<String, Object> item : items) {
                Long id = Long.valueOf(item.get("id").toString());
                Integer displayOrder = (Integer) item.get("displayOrder");

                projectService.getProjectById(id).ifPresent(project -> {
                    project.setDisplayOrder(displayOrder);
                    projectService.updateProject(id, project);
                });
            }
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
